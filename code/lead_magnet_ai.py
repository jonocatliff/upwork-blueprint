#!/usr/bin/env python3
"""Does OpenAI's web search name this business? Three test searches. Needs OPENAI_API_KEY.

    python3 code/lead_magnet_ai.py --run-id <id> --place-id <ChIJ...> --out-dir <dir> \\
        --keyword "emergency plumber" --city "London E4" [--country-code GB] \\
        [--domain example.com] [--name "Example Ltd"]

What is measured is exactly that: three calls to OpenAI's web search, the engine
behind ChatGPT search, never "ChatGPT recommends". The business counts as named
only when an entry's source page, which must also be one of the answer's own
citations, sits on the business's website or is a Google Maps link carrying its
place id. A name alone is recorded but never counted. `recommended` and
`alternatives` are derived here from the stored runs, never written by the model.

Cost: three web search calls per run, 0.01 USD each plus their tokens;
lead_magnet_model.py calculates and records the amount.

Writes `<out-dir>/ai-visibility.json`. Never a gate: no key, no search term or no
readable answer leaves "skipped" in that file and exits 0, so a caller cannot
print an unmeasured zero as a finding.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sys
import urllib.parse

try:
    import lead_magnet_model as model
except ModuleNotFoundError:
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import lead_magnet_model as model

RUNS = 3
LEGAL = re.compile(r"\b(ltd|limited|llc|inc|co|the|and|services?)\b|&|[^a-z0-9 ]")


def host(url: str) -> str:
    value = str(url or "").strip()
    if value and "://" not in value:
        value = "https://" + value
    return re.sub(r"^www\.", "", (urllib.parse.urlparse(value).hostname or "").casefold())


def plain(name: str) -> str:
    return " ".join(LEGAL.sub(" ", str(name or "").casefold()).split())


def prompt(keyword: str, city: str) -> str:
    return (f"I need a {keyword} in {city}. Which local businesses should I call? Name up to 5.\n"
            "Answer only with JSON: [{\"name\": \"...\", \"website\": \"...\", \"sourceUrl\": \"...\"}], "
            "where sourceUrl is the page you used for that business.")


def classify(entries: object, cited: list[str], *, domain: str, place_id: str, name: str) -> list[dict]:
    rows = []
    for entry in entries if isinstance(entries, list) else []:
        if not isinstance(entry, dict) or not str(entry.get("name") or "").strip():
            continue
        source = str(entry.get("sourceUrl") or "").strip()
        verified = any(model.same_page(source, c) for c in cited)
        source_host = host(source) if verified else ""
        match = None
        if verified and domain and source_host == domain:
            match = "domain"
        elif verified and place_id and "google." in source_host and place_id in source:
            match = "listing"
        elif plain(entry["name"]) and plain(entry["name"]) == plain(name):
            match = "nameOnly"
        rows.append({"name": str(entry["name"]).strip(), "sourceUrl": source if verified else None,
                     "hostname": source_host or None, "match": match})
    return rows


def summarise(runs: list[dict]) -> tuple[int, list[dict]]:
    """Only valid runs count; each business at most once per run, so "n of runs" holds."""
    valid = [run for run in runs if run.get("valid", True)]
    recommended = sum(1 for run in valid if any(e["match"] in {"domain", "listing"} for e in run["entries"]))
    others: dict[str, dict] = {}
    for run in valid:
        seen: set[str] = set()
        for entry in run["entries"]:
            if entry["match"]:
                continue
            # Same business under two names in one answer: its hostname decides.
            key = entry.get("hostname") or plain(entry["name"])
            if not key or key in seen:
                continue
            seen.add(key)
            row = others.setdefault(key, {"name": entry["name"], "hostname": entry["hostname"], "mentions": 0})
            row["mentions"] += 1
            row["hostname"] = row["hostname"] or entry["hostname"]
    return recommended, sorted(others.values(), key=lambda r: -r["mentions"])


def write(out: Path, payload: dict) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


def skip(out: Path, base: dict, reason: str, **extra: object) -> int:
    """Record what was not measured, say it in one line, and leave the run alive."""
    write(out, {**base, "skipped": reason, **extra})
    print(f"AI search visibility not measured: {reason}", file=sys.stderr)
    print(json.dumps({"skipped": reason}))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--place-id", required=True)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--keyword", required=True)
    ap.add_argument("--city", required=True)
    ap.add_argument("--country-code", default="")
    ap.add_argument("--domain", default="")
    ap.add_argument("--name", default="")
    a = ap.parse_args()
    out = Path(a.out_dir) / "ai-visibility.json"
    base = {"runId": a.run_id, "placeId": a.place_id}
    try:
        if not model.key():
            return skip(out, base, model.MISSING_KEY)
        if not a.keyword.strip() or not a.city.strip():
            return skip(out, base, "no search term or town")
        domain = host(a.domain)
        location = {"type": "approximate", "city": a.city}
        if len(a.country_code) == 2:
            location["country"] = a.country_code.upper()
        runs = []
        for _ in range(RUNS):
            try:
                data = model.call({
                    "include": ["web_search_call.action.sources"],
                    "tools": [{"type": "web_search", "user_location": location}],
                    "input": prompt(a.keyword, a.city),
                }, "openai/ai-visibility", timeout=180)
            except model.ModelUnavailable as error:
                # One refused call means the next two are refused too. A failed
                # search is missing evidence, so nothing partial is published.
                return skip(out, base, str(error), runs=runs)
            try:
                entries = model.json_from_text(model.text_of(data))
                valid = isinstance(entries, list)
            except ValueError:
                entries, valid = [], False
            cited = model.citations_of(data)
            runs.append({
                "at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "sources": len(cited),
                # An unreadable answer is no measurement: it never counts as "not named".
                "valid": valid,
                "entries": classify(entries, cited, domain=domain,
                                    place_id=a.place_id, name=a.name),
            })
        recommended, alternatives = summarise(runs)
        valid_runs = sum(1 for run in runs if run["valid"])
        if not valid_runs:
            return skip(out, base, "no readable answer", runs=runs)
        write(out, {
            **base,
            "checkedAt": runs[-1]["at"],
            "keyword": a.keyword,
            "city": a.city,
            "runs": runs,
            "validRuns": valid_runs,
            "recommended": recommended,
            "alternatives": alternatives[:5],
        })
    except OSError as error:
        print(f"AI search visibility not measured: {out} is not writable: {error}", file=sys.stderr)
        return 1
    print(json.dumps({"recommended": recommended, "runs": len(runs)}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
