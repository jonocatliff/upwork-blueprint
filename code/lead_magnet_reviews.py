#!/usr/bin/env python3
"""The client's own Google reviews, up to 120 newest first, and the complaints in them.

    python3 code/lead_magnet_reviews.py --run-id <id> --place-id <ChIJ...> --out-dir <dir>
    python3 code/lead_magnet_reviews.py --run-id <id> --place-id <ChIJ...> --out-dir <dir> \\
        --stage themes

Two stages in one module, because both read the same reviews. Stage one is a
single Apify run and needs an Apify token. Stage two groups the low-star
complaints into themes and needs OPENAI_API_KEY. In the theme stage the model
only proposes: code decides what survives, because every review id must be one
we sent, the count is the number of unique valid ids and never the model's own
count, and the quote must be a verbatim part of the review it names.

Only the client's reviews. Competitor review texts would carry most of the added
cost, and the grid already holds their rating and review count.

Cost: the review pull is capped at 0.50 USD per run. Apify refuses a cap under
0.50 (measured 23 September 2026; the plan said 0.30), and a run spends less
than the cap, measured in usageTotalUsd. The theme stage adds one model call.

Writes `<out-dir>/reviews-deep.json` and `<out-dir>/review-themes.json`. Never a
gate: a missing token, a missing key, an empty budget or a failed run leaves
"skipped" in the file and exits 0, so a caller cannot print an unmeasured zero.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import sys
import time
import urllib.error
import urllib.parse

try:
    from lead_magnet_gbp import ACTOR, budget_blocker, request, token
    from lead_magnet_instrument import count_call, record_cost, step
    from lead_magnet_workspace import workspace_root
    import lead_magnet_model as model
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from lead_magnet_gbp import ACTOR, budget_blocker, request, token
    from lead_magnet_instrument import count_call, record_cost, step
    from lead_magnet_workspace import workspace_root
    import lead_magnet_model as model

MAX_REVIEWS = 120
BUDGET_USD = 0.50
REVIEW_ENDPOINT = "apify/google-places-reviews"
THEME_ENDPOINT = "openai/review-themes"
# Mirrors the name list in lead_magnet_gbp.token(), which reads the environment only.
APIFY_KEY_NAMES = ("APIFY_API_TOKEN_PAID", "APIFY_TOKEN", "APIFY_API_TOKEN")
MISSING_TOKEN = ("no Apify token; put one of "
                 + ", ".join(APIFY_KEY_NAMES)
                 + " in .env or the environment (create one at https://console.apify.com/account/integrations)")
MAX_THEMES = 3
MAX_QUOTE_WORDS = 20
PROMPT = """These are low-star Google reviews of one local business, each with an id.
Group the complaints into at most 3 themes a business owner would recognise
(for example "hard to reach by phone", "price higher than quoted").
Only use complaints that are actually written in the reviews. If there are none, return [].
Answer only with JSON: [{"label": "...", "reviewIds": ["r1", ...], "quote": "...", "quoteReviewId": "r1"}]
The quote must be copied word for word from the review quoteReviewId, at most 20 words.

Reviews:
"""


def apify_token() -> str:
    """The token from the environment first, then from .env in this repository.

    The sibling profile module reads the environment only, which leaves a token
    that sits in .env unused when a member runs this module by hand.
    """
    found = token()
    if found:
        return found
    try:
        path = workspace_root() / ".env"
        if path.is_file():
            for line in path.read_text(encoding="utf-8").splitlines():
                name, _, value = line.strip().partition("=")
                if name in APIFY_KEY_NAMES and value.strip().strip('"').strip("'"):
                    return value.strip().strip('"').strip("'")
    except OSError:
        return ""
    return ""


def parse_date(value: object) -> datetime | None:
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def owner_response(review: dict) -> str | None:
    owner = review.get("responseFromOwnerText") or review.get("ownerResponse") or review.get("reviewResponse")
    if isinstance(owner, dict):
        owner = owner.get("text") or owner.get("comment")
    return str(owner) if owner else None


def normalise(raw: list[dict]) -> list[dict]:
    """Stable ids (position in the newest-first list) so themes can point at reviews."""
    reviews = []
    for review in raw:
        if not isinstance(review, dict):
            continue
        when = parse_date(review.get("publishedAtDate"))
        reviews.append({
            "id": f"r{len(reviews) + 1}",
            "stars": review.get("stars"),
            "date": when.date().isoformat() if when else None,
            "text": str(review.get("text") or ""),
            "ownerResponse": owner_response(review),
        })
    return reviews


def metrics(reviews: list[dict], profile_total: int | None, now: datetime) -> dict:
    """Two groups, labelled: the profile's full history and the fetched sample.

    With a truncated list, "last 12 months" is exact only when the oldest fetched
    review is older than 12 months; otherwise it is a floor ("at least N").
    """
    dates = [datetime.fromisoformat(r["date"]).replace(tzinfo=timezone.utc) for r in reviews if r["date"]]
    cutoff = now - timedelta(days=365)
    recent = sum(1 for d in dates if d >= cutoff)
    # Partial whenever the profile counts more than came back, not only at the cap:
    # Apify can return fewer without saying why.
    truncated = profile_total is not None and profile_total > len(reviews)
    covers_year = bool(dates) and min(dates) < cutoff
    answered = sum(1 for r in reviews if r["ownerResponse"])
    stars = {str(n): sum(1 for r in reviews if r["stars"] == n) for n in range(1, 6)}
    newest = max(dates) if dates else None
    return {
        "sampleSize": len(reviews),
        "truncated": truncated,
        "newestDate": newest.date().isoformat() if newest else None,
        "monthsSinceNewest": round((now - newest).days / 30.44, 1) if newest else None,
        "last12Months": recent,
        "last12MonthsIsFloor": truncated and not covers_year,
        "ownerResponseRate": round(answered / len(reviews), 3) if reviews else None,
        "ownerResponses": answered,
        "starBreakdown": stars,
    }


def run_actor(place_id: str, api_token: str) -> tuple[dict, list[dict]]:
    count_call(REVIEW_ENDPOINT, tasks=1)
    query = urllib.parse.urlencode({"maxTotalChargeUsd": f"{BUDGET_USD:.2f}"})
    body = {
        "placeIds": [place_id],
        "scrapePlaceDetailPage": True,
        "scrapeContacts": False,
        "maxReviews": MAX_REVIEWS,
        "reviewsSort": "newest",
        "maxImages": 0,
        "includeWebResults": False,
        "language": "en",
    }
    with step("reviews_deep_start"):
        run = request(f"acts/{ACTOR}/runs?{query}", api_token, body)["data"]
    deadline = time.monotonic() + 240
    while time.monotonic() < deadline:
        time.sleep(5)
        status = request(f"actor-runs/{run['id']}", api_token)["data"]
        if status["status"] not in {"RUNNING", "READY"}:
            break
    else:
        raise RuntimeError("the Apify review pull timed out")
    record_cost(REVIEW_ENDPOINT, status.get("usageTotalUsd") or 0)
    if status["status"] != "SUCCEEDED":
        raise RuntimeError(f"the Apify review pull ended as {status['status']}")
    items = request(f"datasets/{status['defaultDatasetId']}/items?clean=true&format=json", api_token)
    return status, [item for item in items if isinstance(item, dict)]


def validate(themes: object, sent: dict[str, str]) -> list[dict]:
    kept = []
    for theme in themes if isinstance(themes, list) else []:
        if not isinstance(theme, dict) or not str(theme.get("label") or "").strip():
            continue
        ids = sorted({str(i) for i in theme.get("reviewIds") or [] if str(i) in sent})
        quote = " ".join(str(theme.get("quote") or "").split())
        source = str(theme.get("quoteReviewId") or "")
        if not ids or source not in ids or not quote:
            continue
        if len(quote.split()) > MAX_QUOTE_WORDS or quote.casefold() not in " ".join(sent[source].split()).casefold():
            continue
        kept.append({"label": str(theme["label"]).strip(), "reviewIds": ids, "count": len(ids),
                     "quote": quote, "quoteReviewId": source})
    kept.sort(key=lambda t: -t["count"])
    return kept[:MAX_THEMES]


def write(out: Path, payload: dict) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


def note(stage: str, reason: str) -> None:
    print(f"{stage} not measured: {reason}", file=sys.stderr)


def pull_reviews(out: Path, base: dict, place_id: str) -> dict:
    """Stage one: the review sample. Returns what was written, skipped or not."""
    api_token = apify_token()
    if not api_token:
        note("Google reviews", MISSING_TOKEN)
        payload = {**base, "skipped": MISSING_TOKEN}
        write(out, payload)
        return payload
    refusal = budget_blocker(api_token)
    if refusal:
        note("Google reviews", refusal)
        payload = {**base, "skipped": refusal}
        write(out, payload)
        return payload
    try:
        status, items = run_actor(place_id, api_token)
        match = [item for item in items if str(item.get("placeId") or "") == place_id]
        if len(match) != 1:
            raise RuntimeError("the Apify review response did not match the confirmed place id")
    except (RuntimeError, KeyError, OSError, urllib.error.URLError, json.JSONDecodeError) as error:
        note("Google reviews", str(error))
        payload = {**base, "skipped": str(error)[:300]}
        write(out, payload)
        return payload
    place = match[0]
    reviews = normalise(place.get("reviews") or [])
    total = place.get("reviewsCount")
    now = datetime.now(timezone.utc)
    payload = {
        **base,
        "checkedAt": now.isoformat(timespec="seconds"),
        "costUsd": status.get("usageTotalUsd"),
        "profile": {"reviews": total, "rating": place.get("totalScore")},
        "sample": metrics(reviews, total, now),
        "reviews": reviews,
    }
    write(out, payload)
    return payload


def derive_themes(out: Path, base: dict, deep: dict | None, source: Path) -> dict:
    """Stage two: the complaint themes in the low-star reviews of that sample."""
    if deep is None:
        try:
            deep = json.loads(source.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            deep = {}
    if not isinstance(deep, dict) or not deep.get("reviews"):
        reason = deep.get("skipped") if isinstance(deep, dict) and deep.get("skipped") else "no review sample"
        note("Review themes", reason)
        payload = {**base, "skipped": reason}
        write(out, payload)
        return payload
    if deep.get("runId") != base["runId"] or deep.get("placeId") != base["placeId"]:
        reason = "no review sample for this run"
        note("Review themes", reason)
        payload = {**base, "skipped": reason}
        write(out, payload)
        return payload
    if not model.key():
        note("Review themes", model.MISSING_KEY)
        payload = {**base, "skipped": model.MISSING_KEY}
        write(out, payload)
        return payload
    low = {r["id"]: r["text"] for r in deep.get("reviews") or []
           if isinstance(r.get("stars"), (int, float)) and r["stars"] <= 3 and r.get("text", "").strip()}
    if not low:
        payload = {**base, "lowStarReviews": 0, "themes": []}
        write(out, payload)
        return payload
    listing = "\n".join(f"[{rid}] {text}" for rid, text in low.items())
    try:
        data = model.call({"input": PROMPT + listing}, THEME_ENDPOINT)
    except model.ModelUnavailable as error:
        note("Review themes", str(error))
        payload = {**base, "lowStarReviews": len(low), "skipped": str(error)[:300]}
        write(out, payload)
        return payload
    try:
        proposed = model.json_from_text(model.text_of(data))
    except ValueError:
        proposed = []
    payload = {**base, "lowStarReviews": len(low), "themes": validate(proposed, low)}
    write(out, payload)
    return payload


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--place-id", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--stage", choices=("both", "reviews", "themes"), default="both",
                    help="both by default; 'themes' reuses the sample already on disk")
    a = ap.parse_args()
    reviews_file = Path(a.out_dir) / "reviews-deep.json"
    themes_file = Path(a.out_dir) / "review-themes.json"
    base = {"runId": a.run_id, "placeId": a.place_id}
    summary: dict[str, object] = {}
    try:
        deep = pull_reviews(reviews_file, base, a.place_id) if a.stage in {"both", "reviews"} else None
        # A skipped stage reports null, never 0: a caller must not read an
        # unmeasured stage as a business with no reviews and no complaints.
        if deep is not None:
            summary["reviews"] = None if deep.get("skipped") else len(deep.get("reviews") or [])
            summary["total"] = (deep.get("profile") or {}).get("reviews")
            if deep.get("skipped"):
                summary["reviewsNotMeasured"] = deep["skipped"]
        if a.stage in {"both", "themes"}:
            themes = derive_themes(themes_file, base, deep, reviews_file)
            summary["lowStarReviews"] = themes.get("lowStarReviews")
            summary["themes"] = None if themes.get("skipped") else len(themes.get("themes") or [])
            if themes.get("skipped"):
                summary["themesNotMeasured"] = themes["skipped"]
    except OSError as error:
        print(f"Google reviews not measured: {a.out_dir} is not writable: {error}", file=sys.stderr)
        return 1
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
