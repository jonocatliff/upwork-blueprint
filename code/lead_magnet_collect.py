#!/usr/bin/env python3
"""Run the evidence chain once and finish with a compact operator briefing.

The order is fixed: lead_magnet_cro writes cro.json, lead_magnet_keywords needs that file
and writes the keyword cache, then lead_magnet_search reads the cache. The market is
always passed explicitly with --market rather than inferred.
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import time
import unicodedata

try:
    from lead_magnet_instrument import step
except ModuleNotFoundError:  # importlib-based local tests do not add this folder to sys.path
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    from lead_magnet_instrument import step

ERRORS: list[str] = []
NOTES: list[str] = []
# A second call in the same run may reuse the measurement. A later run may not.
CRO_MAX_ALTER_S = 6 * 3600


def run_step(command: list[str], target: pathlib.Path | None, name: str) -> bool:
    """Run one chain step, writing stdout to its evidence file."""
    print(f"→ {name}", file=sys.stderr)
    with step(name):
        completed = subprocess.run(command, capture_output=True, text=True)
    if completed.stderr.strip():
        print(completed.stderr.strip()[-1500:], file=sys.stderr)
    if completed.returncode != 0:
        ERRORS.append(f"{name}: Exit {completed.returncode}")
        return False
    if target is not None:
        target.write_text(completed.stdout)
        if len(completed.stdout) < 200:
            ERRORS.append(f"{name}: output is too thin at {len(completed.stdout)} characters")
            return False
    else:
        print(completed.stdout.strip()[:4000])
    return True


def shorten(payload, limit: int = 400) -> str:
    """Never print embedded image data into the run log."""
    text = json.dumps(payload, ensure_ascii=False) if not isinstance(payload, str) else payload
    if "data:image" in text or "base64," in text:
        return "<embedded image data omitted>"
    return text[:limit]


def tempo_nachholen(cro_file: pathlib.Path, url: str) -> None:
    """Retry the local Lighthouse measurement once when the first result is empty."""
    daten = read_json(cro_file, "cro.json")
    if not daten or (daten.get("speed") or {}).get("ok"):
        return
    if not shutil.which("lighthouse"):
        ERRORS.append("Speed: local Lighthouse is unavailable; run setup first")
        return

    print("→ Mobile speed second attempt", file=sys.stderr)
    try:
        roh = subprocess.run(
            ["lighthouse", url, "--quiet", "--output=json", "--output-path=stdout",
             "--only-categories=performance,accessibility,best-practices,seo", "--form-factor=mobile",
             "--screenEmulation.mobile",
             "--chrome-flags=--headless=new --no-sandbox --ignore-certificate-errors"],
            capture_output=True, text=True, timeout=180)
        report_json = json.loads(roh.stdout)
    except Exception as problem:                              # noqa: BLE001
        ERRORS.append(f"Speed: the second attempt also failed ({problem})")
        return

    pruefungen = report_json.get("audits") or {}
    lcp = (pruefungen.get("largest-contentful-paint") or {}).get("numericValue")
    kategorien = report_json.get("categories") or {}
    punkte = (kategorien.get("performance") or {}).get("score")
    scores = {
        name: round(((kategorien.get(name) or {}).get("score") or 0) * 100)
        for name in ("performance", "accessibility", "best-practices", "seo")
        if (kategorien.get(name) or {}).get("score") is not None
    }
    if lcp is None:
        ERRORS.append("Speed: the second attempt returned no timing")
        return
    daten["speed"] = {"ok": True, "lcp": f"{lcp / 1000:.1f} s",
                      "score": round((punkte or 0) * 100), "scores": scores, "frames": [],
                      "note": "second attempt, without the filmstrip"}
    cro_file.write_text(json.dumps(daten))


def strip_filmstrip(cro_file: pathlib.Path) -> dict:
    """Drop unused PageSpeed thumbnails but preserve the rendered page proof."""
    try:
        before = cro_file.stat().st_size
        data = json.loads(cro_file.read_text())
        speed = data.get("speed") or {}
        frames = speed.get("frames") or []
        if not frames or not speed.get("screenshot"):
            return {"stripped": False, "before_bytes": before, "after_bytes": before}
        speed["frames"] = []
        temporary = cro_file.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(data, ensure_ascii=False))
        temporary.replace(cro_file)
        return {
            "stripped": True,
            "before_bytes": before,
            "after_bytes": cro_file.stat().st_size,
            "frames_removed": len(frames),
        }
    except (OSError, json.JSONDecodeError, TypeError) as error:
        NOTES.append(f"Could not remove unused filmstrip frames: {error}")
        return {"stripped": False}


def pruefliste_passt(cro_file: pathlib.Path) -> bool:
    """Reuse only evidence created with the current checklist."""
    try:
        measured = {e.get("key") for e in (json.loads(cro_file.read_text()).get("elements") or [])}
        source = (pathlib.Path("code/lead_magnet_cro.py").read_text()
                  if pathlib.Path("code/lead_magnet_cro.py").exists() else "")
        erwartet = set(re.findall(r'^\s*\("([a-z_]+)",\s*"', source, re.M))
        return bool(erwartet) and erwartet.issubset(measured)
    except (OSError, json.JSONDecodeError, TypeError):
        return False


def read_json(json_path: pathlib.Path, name: str) -> dict:
    try:
        return json.loads(json_path.read_text())
    except (OSError, json.JSONDecodeError) as problem:
        ERRORS.append(f"{name}: unreadable ({problem})")
        return {}


def _compact(value: str) -> str:
    folded = unicodedata.normalize("NFKD", value.casefold())
    ascii_value = "".join(ch for ch in folded if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]", "", ascii_value)


def _looks_like_brand_query(row: dict, business: str) -> bool:
    """Use the already-pulled SERP to reject own and competitor brand terms."""
    raw_keyword = str(row.get("keyword") or "")
    keyword = _compact(raw_keyword)
    keyword_words = re.findall(r"[a-z0-9]+", unicodedata.normalize(
        "NFKD", raw_keyword.casefold()
    ).encode("ascii", "ignore").decode())
    if not keyword:
        return True
    own = _compact(business)
    if own and (
        own == keyword
        or (len(keyword_words) >= 2 and (own in keyword or keyword in own))
    ):
        return True
    for item in row.get("resultItems") or []:
        if item.get("type") not in {"local_pack", "maps", "map"}:
            continue
        names = [item.get("title")]
        names.extend(
            candidate.get("title")
            for candidate in item.get("items") or []
            if isinstance(candidate, dict)
        )
        for name in names:
            title = _compact(str(name or ""))
            if len(title) >= 5 and (
                title == keyword
                or (len(keyword_words) >= 2 and (title in keyword or keyword in title))
            ):
                return True
    return False


def grid_term_without_city(term: str, city: str) -> str:
    """The grid searches from a coordinate, so the term carries no town.

    "Locksmith Coventry" from a point 4 km north of Coventry returned three
    junk results; the bare "locksmith" returned the full local ranking
    (measured 05.09.2026). The town-qualified term stays the organic check.
    """
    term = (term or "").strip()
    city = (city or "").strip()
    if not term or not city:
        return term
    stripped = re.sub(rf"\s+{re.escape(city)}\s*$", "", term, flags=re.I).strip()
    return stripped or term


# Words that appear in every category and therefore separate nothing.
INDUSTRY_FILLER_WORDS = {"service", "services", "shop", "store", "company", "contractor",
                         "establishment", "repair", "center", "centre", "business"}


def _industry_words(category: str) -> set[str]:
    return {w for w in re.findall(r"[a-z]+", (category or "").casefold())
            if len(w) > 2 and w not in INDUSTRY_FILLER_WORDS}


def choose_grid_keyword(cache: dict, business: str, category: str = "") -> str | None:
    """The strongest checked generic term with a real local pack, from his own industry.

    THE TERM MUST BELONG TO THE BUSINESS (measured 21 September 2026). A towing
    business was measured on "locksmith": keyword research proposed the term with
    the larger volume (3,600 against 1,300), and that term came from our earlier
    niche, not from his categories. Zero out of 25 points was the result -
    arithmetically correct, worthless as a finding and harmful in the call, because
    it only says that he is not a locksmith.

    When we know his category, the term has to share at least one carrying word
    with it. When we do not know it, the old behaviour stands: a missing category
    must never prevent a grid.
    """
    if cache.get("market") != "local":
        return None
    searches = cache.get("searches") or []
    preferred = _compact(str(cache.get("mapKeyword") or ""))
    ordered = [
        row for row in searches
        if preferred and _compact(str(row.get("keyword") or "")) == preferred
    ]
    ordered.extend(row for row in searches if row not in ordered)
    expected = _industry_words(category)
    # NO TOWN NAME (measured 21 September 2026): the grid asks the same term at
    # 25 coordinates. With the town already in the term, every point measures the
    # same city, and the map shows a flat surface instead of a gradient. "Towing
    # service Galway" therefore falls behind "towing service".
    location_words = {w for w in re.findall(r"[a-z]+", str(cache.get("location") or "").casefold())
                      if len(w) > 2}
    if location_words:
        ordered.sort(key=lambda r: bool(_industry_words(str(r.get("keyword") or "")) & location_words))
    for second_pass in (False, True):
        for row in ordered:
            if not row.get("hasLocalPack") or _looks_like_brand_query(row, business):
                continue
            term = str(row.get("keyword") or "").strip()
            if not term:
                continue
            # First pass: only terms from his industry. Second pass (only without
            # a known category): the old behaviour.
            if not second_pass and expected and not (_industry_words(term) & expected):
                continue
            if second_pass and expected:
                return None
            return term
    return None


def keyword_cache_reusable(
    cache: dict,
    *,
    market: str,
    auto_grid: bool,
    business: str,
    location: str = "",
    category: str = "",
) -> bool:
    """Reuse evidence only when it can still produce the promised report."""
    if cache.get("stage") != "complete" or cache.get("market") != market:
        return False
    if location and cache.get("location") != location:
        return False
    if market == "local" and auto_grid:
        return bool(cache.get("mapKeyword") and choose_grid_keyword(cache, business, category))
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--url", required=True, help="vollstaendige Startseite")
    ap.add_argument("--domain", required=True)
    ap.add_argument("--business", required=True)
    ap.add_argument("--location", required=True, help="DataForSEO-Location, z. B. United Kingdom")
    ap.add_argument("--language", default="English")
    ap.add_argument("--market", required=True, choices=("local", "national", "remote"),
                    help="explicit market decision from the confirmed business profile")
    ap.add_argument("--coordinate", default="", help="lat,lng aus gbp_profile.py")
    ap.add_argument("--grid", default="",
                    help="keyword for the 25-point grid; without it the run stops after keyword research")
    ap.add_argument("--auto-grid", action="store_true",
                    help="use the strongest verified generic local-pack term, or omit an unsafe grid")
    ap.add_argument("--country-code", default="")
    ap.add_argument("--radius", type=float, default=0.0,
                    help="km from the centre to the outer grid points; 0 takes pull_search's own default")
    ap.add_argument("--zoom", type=int, default=0, help="Kartenzoom je Rasterpunkt; 0 = Vorgabe von pull_search")
    ap.add_argument("--outdir", required=True)
    ap.add_argument("--town", default="", help="town for the on-page checks in lead_magnet_cro")
    ap.add_argument("--category", default="",
                    help="Google category for the on-page checks in lead_magnet_cro")
    ap.add_argument("--address", default="",
                    help="profile address; its postcode is compared with the page")
    a = ap.parse_args()


    # Aus engine/ aufrufen, sonst zeigen die relativen Pfade ins Leere.
    if not pathlib.Path("code/lead_magnet_cro.py").exists():
        print("Run from the repo root: code/lead_magnet_cro.py is not visible here",
              file=sys.stderr)
        return 2

    out = pathlib.Path(a.outdir)
    out.mkdir(parents=True, exist_ok=True)
    os.environ["BLUEPRINT_METRICS_DIR"] = str(out)
    cro_file, cache_file, search_file = (out / "cro.json", out / "keyword-cache.json",
                                            out / "search.json")
    # The page text falls out of the CRO run anyway, and it stays out of cro.json,
    # which is the client-facing checklist.
    site_file = out / "site.json"

    # A second call with --grid reuses evidence from the same run.
    # The age and checklist guards prevent an old measurement from being reused.
    #
    # ON 20 SEPTEMBER 2026 EXACTLY THAT HAPPENED AGAIN, one level more subtle:
    # three reports in a row carried the same wrong finding, because the fix was
    # in the check code, but the six hours were still running and the checklist
    # was unchanged. The age of the file does not measure what produced it. So
    # from now on the check code decides as well: if lead_magnet_cro.py is newer
    # than cro.json, then cro.json is from yesterday, however young it looks.
    # Within the same run reuse survives, because cro.json is written after the
    # code has been copied.
    check_code = pathlib.Path("code/lead_magnet_cro.py")
    code_newer = (check_code.exists() and cro_file.exists()
                  and check_code.stat().st_mtime > cro_file.stat().st_mtime)
    frisch = (cro_file.exists() and cro_file.stat().st_size > 200
              and (time.time() - cro_file.stat().st_mtime) < CRO_MAX_ALTER_S
              and not code_newer
              and pruefliste_passt(cro_file))
    if frisch:
        print("-> pull_cro reused from this run", file=sys.stderr)
        cro_ok = True
    else:
        cro_command = ["python3", "code/lead_magnet_cro.py", a.url, "--embed-frames",
                       "--site-out", str(site_file)]
        # Town, category and postcode are what the on-page checks judge title and
        # headline against. Each is passed only when it is known.
        for flag, value in (("--town", a.town), ("--category", a.category),
                            ("--address", a.address)):
            if value:
                cro_command += [flag, value]
        cro_ok = run_step(cro_command, cro_file, "pull_cro")
    if not cro_ok:
        # Keyword research cannot start without complete CRO evidence.
        report({}, {}, {}, out)
        return 1

    tempo_nachholen(cro_file, a.url)
    strip_result = strip_filmstrip(cro_file)
    if strip_result.get("stripped"):
        print(
            f"→ filmstrip dropped: {strip_result['before_bytes']} → "
            f"{strip_result['after_bytes']} Bytes",
            file=sys.stderr,
        )

    keyword_command = ["python3", "code/lead_magnet_keywords.py", a.domain,
                      "--cro", str(cro_file), "--cache", str(cache_file),
                      "--location", a.location, "--language", a.language,
                      "--business", a.business, "--market", a.market]
    profile_file = out / "gbp-profile.json"
    if profile_file.exists():
        keyword_command += ["--profile-json", str(profile_file)]
    if a.country_code:
        keyword_command += ["--country-code", a.country_code]
    # The place as a coordinate, not as a name: the data provider knows only its
    # 7,667 British town names, Google knows every hamlet (measured 21 September
    # 2026).
    if a.coordinate:
        keyword_command += ["--coordinate", a.coordinate]
    existing_cache = (
        read_json(cache_file, "keyword-cache.json")
        if cache_file.exists() and cache_file.stat().st_size > 200
        else {}
    )
    if keyword_cache_reusable(
        existing_cache,
        market=a.market,
        auto_grid=a.auto_grid,
        business=a.business,
        location=a.location,
        category=a.category,
    ):
        print("-> proposal_keywords reused a valid cache", file=sys.stderr)
        keywords_ok = True
    else:
        if existing_cache:
            print("-> proposal_keywords refreshes an incomplete grid cache", file=sys.stderr)
        keywords_ok = run_step(keyword_command, None, "proposal_keywords")

    # Never guess the grid term. mapKeyword is a candidate, not a verdict.
    cache = read_json(cache_file, "keyword-cache.json") if keywords_ok else {}
    grid = a.grid
    if keywords_ok and a.auto_grid and not grid:
        grid = choose_grid_keyword(cache, a.business, a.category)
        if grid:
            print(f"→ Map grid term verified automatically: {grid!r}", file=sys.stderr)
        elif cache.get("market") == "local":
            NOTES.append("No safe generic local-pack term; map grid omitted")

    if keywords_ok and not grid and not a.auto_grid:
        print("\n=== Stopped before the map grid ===")
        print(f"mapKeyword: {cache.get('mapKeyword')!r}")
        print(f"moneyKeyword: {cache.get('moneyKeyword')!r}")
        print(f"Market: {cache.get('market')} - {cache.get('marketReason')}")
        print("A term containing any brand name is invalid.")
        print("Choose the strongest generic service term.")
        print("Continue with the same command plus --grid \"<term>\"; existing evidence remains available.")
        return 0

    search: dict = {}
    if keywords_ok:
        search_command = ["python3", "code/lead_magnet_search.py", a.domain,
                         "--keyword-cache", str(cache_file), "--embed-map",
                         "--location", a.location, "--language", a.language,
                         "--business", a.business]
        if profile_file.exists():
            search_command += ["--profile-json", str(profile_file)]
        if grid:
            search_command += ["--grid", grid_term_without_city(grid, str(cache.get("profileCity") or ""))]
        if a.coordinate:
            search_command += ["--coordinate", a.coordinate]
        if a.radius:
            search_command += ["--radius", str(a.radius)]
        if a.zoom:
            search_command += ["--zoom", str(a.zoom)]
        run_step(search_command, search_file, "pull_search")
        search = read_json(search_file, "search.json")
    else:
        ERRORS.append("pull_search: skipped because keyword research failed")

    report(read_json(cro_file, "cro.json"), read_json(cache_file, "keyword-cache.json"), search, out)
    return 0 if not ERRORS else 1


def report(cro: dict, cache: dict, search: dict, out: pathlib.Path) -> None:
    """Print a compact operator briefing and the evidence paths."""
    try:
        _report(cro, cache, search, out)
    except Exception as problem:                              # noqa: BLE001
        # The evidence remains valid if this convenience summary fails.
        print(f"\n=== Briefing incomplete ({problem}) ===")
        print(f"The evidence still remains at: {out}/cro.json, {out}/keyword-cache.json, "
              f"{out}/search.json")


def _report(cro: dict, cache: dict, search: dict, out: pathlib.Path) -> None:
    print("\n=== Briefing ===")
    # `have` and `total` are numbers, while older snapshots may use a list.
    have, gesamt = cro.get("have"), cro.get("total")
    missing = cro.get("missing")
    if isinstance(have, int) and isinstance(gesamt, int):
        print(f"Conversion: {have} of {gesamt} elements found")
    elif isinstance(have, list):
        print(f"Conversion: {len(have)} found")
    if isinstance(missing, list) and missing:
        print(f"  missing: {shorten(missing[:8])}")
    speed = cro.get("speed") or {}
    if speed:
        print(f"Mobile speed: {speed.get('score')} / LCP {speed.get('lcp')}")
    for feld in ("observed", "findings"):
        if cro.get(feld):
            print(f"Visible findings: {shorten(cro[feld])}")
            break

    if cache:
        print(f"Market: {cache.get('market')} - {cache.get('marketReason')}")
        print(f"Money keyword: {cache.get('moneyKeyword')} | Map keyword: {cache.get('mapKeyword')}")
        if cache.get("errors"):
            ERRORS.append(f"keyword-cache reported errors: {cache['errors']}")

    raster = (search.get("geoGrid") or {})
    if raster:
        raenge = [r for r in (raster.get("ranks") or []) if isinstance(r, int)]
        top3 = sum(1 for r in raenge if r <= 3)
        print(f"Map grid '{raster.get('keyword')}': top 3 at {top3} of {len(raenge)} points")
    if search.get("missing"):
        print(f"Missing organic evidence: {shorten(search['missing'])}")

    print(f"\nFiles: {out}/cro.json, {out}/keyword-cache.json, {out}/search.json")
    print("\nMissing sources:")
    print("\n".join(f"  - {z}" for z in ERRORS) if ERRORS else "  none")
    if NOTES:
        print("\nIntentional omissions:")
        print("\n".join(f"  - {z}" for z in NOTES))


if __name__ == "__main__":
    raise SystemExit(main())
