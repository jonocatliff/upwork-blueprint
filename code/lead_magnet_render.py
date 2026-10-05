#!/usr/bin/env python3
"""Render one private, evidence-only local SEO audit as self-contained HTML."""

from __future__ import annotations

import argparse
import datetime as dt
import html
import json
from pathlib import Path
import shutil
import subprocess
from typing import Any
from urllib.parse import urlparse


def read_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path.name} must contain one JSON object")
    return value


def clean(value: Any) -> str:
    return html.escape(str(value or "").strip(), quote=True)


def maps_score(search: dict[str, Any]) -> tuple[float | None, int, int]:
    grid = search.get("geoGrid") if isinstance(search.get("geoGrid"), dict) else {}
    all_ranks = grid.get("ranks") if isinstance(grid.get("ranks"), list) else []
    checked = int(grid.get("checkedPoints") or 0)
    requested = int(grid.get("requestedPoints") or 0)
    if checked != 25 or requested != 25 or len(all_ranks) != 25:
        return None, 0, 0
    ranks = [rank for rank in all_ranks if isinstance(rank, int) and rank > 0]
    top_three = sum(1 for rank in ranks if rank <= 3)
    return top_three / checked, top_three, checked


def profile_score(search: dict[str, Any]) -> tuple[float | None, list[dict[str, Any]]]:
    profile = search.get("gbp") if isinstance(search.get("gbp"), dict) else {}
    rows = [row for row in profile.get("auditRows", []) if isinstance(row, dict)]
    # The panel judges the latest update and the review replies from the profile
    # itself, so those two rows can show "Improve" while the row status still
    # says good. The score counts them the way the client sees them, or a 100
    # sits above two rows that plainly are not.
    current = profile.get("current") if isinstance(profile.get("current"), dict) else {}
    post = current.get("post") if isinstance(current.get("post"), dict) else {}
    post_finding = post.get("finding") if isinstance(post.get("finding"), dict) else {}
    reviews_finding = current.get("reviewsFinding") if isinstance(current.get("reviewsFinding"), dict) else {}
    warn_labels = {"Updates"} if post_finding.get("status") == "warn" else set()
    if reviews_finding.get("status") == "warn":
        warn_labels.add("Reviews")
    graded = [row for row in rows if row.get("status") in {"good", "warn", "bad"}]
    if not graded:
        return None, rows
    weight = {"good": 1.0, "warn": 0.5, "bad": 0.0}
    points = sum(0.5 if row.get("label") in warn_labels and row["status"] == "good"
                 else weight[row["status"]] for row in graded)
    return points / len(graded), rows


def website_score(cro: dict[str, Any]) -> tuple[float | None, list[dict[str, Any]]]:
    rows = [row for row in cro.get("elements", []) if isinstance(row, dict) and row.get("applies") is not False]
    if not rows:
        return None, []
    found = sum(1 for row in rows if row.get("present") is True)
    return found / len(rows), rows


def overall_score(values: list[float | None]) -> float | None:
    measured = [value for value in values if value is not None]
    return sum(measured) / len(measured) if measured else None


def conclusion(score: float | None) -> str:
    if score is None:
        return "The audit needs more evidence before it can draw a conclusion."
    if score >= 0.8:
        return "The foundations are strong. A few focused improvements can make them work harder."
    if score >= 0.55:
        return "Customers can find and assess the business, but several gaps still cost enquiries."
    return "The business is harder to find and choose than it needs to be."


TEMPLATE = Path(__file__).resolve().parents[1] / "templates" / "lead-magnet" / "dist" / "index.html"


def needs_build(template: Path | None = None) -> bool:
    """A build is stale when any template source is newer than it."""
    template = TEMPLATE if template is None else template
    if not template.is_file():
        return True
    folder = template.parent.parent
    sources = [p for p in folder.iterdir() if p.is_file()]
    sources += [p for p in (folder / "src").rglob("*") if p.is_file()]
    built = template.stat().st_mtime
    return any(p.stat().st_mtime > built for p in sources)


def ensure_template(env: dict[str, str] | None = None) -> None:
    fix = "Run 'cd templates/lead-magnet && npm install && npm run build' to fix the audit report template."
    if needs_build():
        npm = shutil.which("npm")
        if not npm:
            raise RuntimeError("Install Node.js, then run setup.sh to build the audit report template.")
        done = subprocess.run([npm, "run", "build", "--silent"], cwd=TEMPLATE.parent.parent,
                              env=env, capture_output=True, text=True)
        if done.returncode or needs_build():
            raise RuntimeError(fix)
    try:
        valid = TEMPLATE.read_text(encoding="utf-8").count("__LEAD_MAGNET_DATA__") == 1
    except (OSError, UnicodeError):
        valid = False
    if not valid:
        raise RuntimeError(fix)


def safe_asset(value: Any) -> str:
    text = str(value or "").strip()
    return text if text.startswith(("data:image/png;base64,", "data:image/jpeg;base64,")) else ""


def score_number(value: float | None) -> int | None:
    """None stays None. A zero here would be the report's worst lie: it reads as
    "you rank nowhere" when it means "we could not measure this"."""
    return None if value is None else round(value * 100)


def optional_rows(extra: dict[str, Any] | None) -> list[dict[str, Any]]:
    """Rows for the measurements that need a key the member may not have.

    Each one is dropped rather than guessed. A row saying "not measured" teaches
    the client nothing, and a zero that came from a missing key is the one
    mistake they can catch by looking. Both files say `skipped` instead of a
    number when they could not measure.

    Opening hours are deliberately not here. They are read before the search step
    and go into the profile, so the existing Hours row carries them and the report
    never holds two answers to one question.
    """
    rows: list[dict[str, Any]] = []
    extra = extra or {}

    ai = extra.get("ai") if isinstance(extra.get("ai"), dict) else {}
    searches = ai.get("validRuns")
    if not ai.get("skipped") and isinstance(searches, int) and searches:
        named = int(ai.get("recommended") or 0)
        rows.append({
            "label": "AI search",
            "value": (f"Named in {named} of {searches} AI searches for this service."
                      if named else
                      f"Not named in any of the {searches} AI searches for this service."),
            "status": "good" if named else "bad",
        })

    themes = extra.get("themes") if isinstance(extra.get("themes"), dict) else {}
    labels = [str(t.get("label")).strip() for t in (themes.get("themes") or [])
              if isinstance(t, dict) and str(t.get("label") or "").strip()]
    if not themes.get("skipped") and labels:
        rows.append({
            "label": "What the lowest reviews say",
            "value": "; ".join(labels[:3]) + ".",
            "status": "warn",
        })

    return rows


def proposal_data(
    business: str,
    cro: dict[str, Any],
    search: dict[str, Any],
    measured_at: str,
    location: str = "",
    site: dict[str, Any] | None = None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    map_value, top_three, checked = maps_score(search)
    profile_value, profile_rows_list = profile_score(search)
    website_value, website_checks = website_score(cro)
    total_value = overall_score([map_value, profile_value, website_value])
    grid = search.get("geoGrid") if isinstance(search.get("geoGrid"), dict) else {}
    gbp_source = search.get("gbp") if isinstance(search.get("gbp"), dict) else {}
    profile = gbp_source.get("profile") if isinstance(gbp_source.get("profile"), dict) else {}
    ranks = list(grid.get("ranks") or [])
    complete_grid = ranks if map_value is not None else None
    winners = []
    for item in grid.get("winners", []):
        if not isinstance(item, dict) or not item.get("name") or not isinstance(item.get("topThreePoints"), int):
            continue
        winners.append({
            "name": str(item["name"]),
            "topThreePoints": item["topThreePoints"],
            "bestRank": item.get("bestRank") if isinstance(item.get("bestRank"), int) else None,
            "rating": item.get("rating") if isinstance(item.get("rating"), (int, float)) else None,
            "reviews": item.get("reviews") if isinstance(item.get("reviews"), int) else None,
            "category": item.get("category") or None,
        })
    client = grid.get("client") if isinstance(grid.get("client"), dict) else None
    geo_grid = {
        "keyword": str(grid.get("keyword") or "Local service search"),
        "businessName": business,
        "ranks": complete_grid,
        "mapImage": safe_asset(grid.get("mapImage")) or None,
        "note": str(grid.get("note") or ("25 locations checked across the service area." if complete_grid else "The complete 25-point map grid was not measured.")),
        "winners": winners,
        "client": client,
    }
    graded_rows = [
        {"label": str(row.get("label") or "Check"), "value": str(row.get("value") or "No detail returned."), "status": row["status"]}
        for row in profile_rows_list if row.get("status") in {"good", "warn", "bad"}
    ]
    graded_rows.extend(optional_rows(extra))
    rating = profile.get("rating")
    reviews = profile.get("reviews")
    panel = None
    if isinstance(rating, (int, float)) and isinstance(reviews, int):
        panel = {
            "name": str(profile.get("name") or business),
            "subtitle": " · ".join(str(value) for value in (profile.get("category"), profile.get("city") or location) if value),
            "ratingValue": float(rating),
            "reviewsCount": reviews,
            "description": profile.get("description") or None,
            "mapImage": safe_asset(profile.get("main_image")) or None,
            "photoLabel": f"{profile.get('photos')} public photos" if isinstance(profile.get("photos"), int) else None,
        }
    gbp = None
    if graded_rows:
        gbp = {
            "panel": panel,
            "auditRows": graded_rows,
            "auditNote": str(gbp_source.get("auditNote") or "Every row describes public profile evidence."),
            "clientName": str(profile.get("name") or business),
            "note": "",
        }
    elements = []
    for item in website_checks:
        elements.append({
            "key": item.get("key") or None,
            "label": str(item.get("label") or "Website check"),
            "present": item.get("present") is True,
            "applies": item.get("applies") is not False,
            "consequence": str(item.get("consequence") or item.get("evidence") or "No detail returned."),
        })
    speed_source = cro.get("speed") if isinstance(cro.get("speed"), dict) else {}
    scores = speed_source.get("scores") if isinstance(speed_source.get("scores"), dict) else {}
    numeric_scores = [value for value in scores.values() if isinstance(value, (int, float))]
    speed = None
    if speed_source.get("ok") and numeric_scores:
        speed = {
            "lcp": str(speed_source.get("lcp") or "Not returned"),
            "score": round(sum(numeric_scores) / len(numeric_scores)),
            "scores": scores,
            "screenshot": safe_asset(speed_source.get("screenshot")) or None,
            "desktopScreenshot": safe_asset(speed_source.get("desktopScreenshot")) or None,
            "frames": [],
            "note": str(speed_source.get("note") or "Google Lighthouse mobile measurement."),
        }
    speed_note = "Rendered website and mobile Lighthouse evidence from this run."
    if speed_source and not speed_source.get("ok"):
        speed_note = f"Mobile speed not measured: {speed_source.get('why') or 'no result was returned'}."
    try:
        date_label = dt.date.fromisoformat(measured_at).strftime("%d %B %Y").lstrip("0")
    except ValueError:
        date_label = measured_at
    host = (urlparse(str(cro.get("url") or "")).hostname or "").removeprefix("www.")
    return {
        "slug": "private-audit",
        "language": "en",
        "clientName": business,
        "clientDomain": host,
        "clientFaviconUrl": "",
        "preparedBy": "Your freelancer",
        "preparedByCompany": "",
        "dateLabel": date_label,
        "expiryLabel": "",
        "heroLead": conclusion(total_value),
        # The three section scores travel with the report instead of being
        # recomputed on the page. They were computed in both places, with
        # different formulas, so the client read one number and this file's
        # rules described another.
        "scorecard": {
            "overall": score_number(total_value),
            "overallReason": conclusion(total_value),
            "pillars": [
                {"name": "Maps", "score": score_number(map_value),
                 "reason": f"{top_three} of {checked} grid points in the top three" if checked
                           else "The grid could not be measured in full"},
                {"name": "Profile", "score": score_number(profile_value),
                 "reason": f"{len([r for r in profile_rows_list if r.get('status') in {'good', 'warn', 'bad'}])} profile rows graded"},
                {"name": "Website", "score": score_number(website_value),
                 "reason": f"{sum(1 for r in website_checks if r.get('present') is True)} of {len(website_checks)} checks present"},
            ],
        },
        "money": {},
        "cro": {
            "elements": elements,
            "have": sum(1 for item in elements if item["present"] and item["applies"]),
            "total": sum(1 for item in elements if item["applies"]),
            "speed": speed,
            "read": conclusion(website_value),
            "sourcesLine": speed_note,
        } if elements or speed else None,
        "findings": {
            "rows": [],
            "items": [],
            "serp": None,
            "geoGrid": geo_grid,
            "gbp": gbp,
            "missing": [],
        },
        "timeline": {"rows": [], "expectation": ""},
        "investment": {"options": [], "terms": ""},
        "proof": {"items": [], "credentials": []},
        "faq": [],
        "close": {"costReminder": "", "ctaLabel": "Reply here on Upwork", "ctaUrl": "#reply"},
    }


def render(
    business: str,
    cro: dict[str, Any],
    search: dict[str, Any],
    measured_at: str,
    location: str = "",
    site: dict[str, Any] | None = None,
    extra: dict[str, Any] | None = None,
) -> str:
    ensure_template()
    template = TEMPLATE.read_text(encoding="utf-8")
    payload = json.dumps(proposal_data(business, cro, search, measured_at, location, site, extra),
                         ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("</", "<\\/")
    page = template.replace("__LEAD_MAGNET_DATA__", payload)
    return page.replace("<title>Private website audit</title>", f"<title>Private website audit for {clean(business)}</title>")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--business", required=True)
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--measured-at", default=dt.date.today().isoformat())
    parser.add_argument("--location", default="")
    args = parser.parse_args()
    cro = read_json(args.evidence / "cro.json")
    search = read_json(args.evidence / "search.json")
    site = read_json(args.evidence / "site.json")
    extra = {key: read_json(args.evidence / name)
             for key, name in (("ai", "ai-visibility.json"), ("themes", "review-themes.json"))
             if (args.evidence / name).is_file()}
    page = render(args.business, cro, search, args.measured_at, args.location, site, extra)
    if page.count('data-audit-section="') != 3:
        raise RuntimeError("report must contain exactly three audit sections")
    args.output.write_text(page, encoding="utf-8")
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
