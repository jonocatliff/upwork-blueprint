#!/usr/bin/env python3
"""Build one SEO audit for local review from a saved Upwork lead source."""

from __future__ import annotations

import argparse
import datetime as dt
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import urlparse
from pitch_deploy import load_dotenv
import lead_magnet_render


ROOT = Path(__file__).resolve().parents[1]
ID = re.compile(r"^[0-9]{6,25}$")
REQUIRED_KEYS = (
    ("FIRECRAWL_API_KEY",),
    ("APIFY_API_TOKEN_PAID", "APIFY_TOKEN", "APIFY_API_TOKEN"),
    ("DATAFORSEO_LOGIN",),
    ("DATAFORSEO_PASSWORD",),
)


def runtime_error(env: dict[str, str], *, find_spec=importlib.util.find_spec, which=shutil.which) -> str:
    packages = [name for name, module in (("Pillow", "PIL"), ("Playwright", "playwright"))
                if find_spec(module) is None]
    if packages:
        return f"Install {', '.join(packages)} from requirements.txt before starting the paid audit."
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as playwright:
            playwright.chromium.launch(headless=True).close()
    except Exception:
        return "Run 'python3 -m playwright install chromium' and check headless Chromium before starting the paid audit."
    try:
        lead_magnet_render.ensure_template(env)
    except (RuntimeError, OSError) as error:
        return str(error)
    if not env.get("PAGESPEED_API_KEY", "").strip() and which("lighthouse") is None:
        return "Add PAGESPEED_API_KEY to .env or install local Lighthouse before starting the paid audit."
    return ""


def load_env(path: Path, env: dict[str, str]) -> None:
    load_dotenv(path, env)


def command(parts: list[str], *, cwd: Path, env: dict[str, str], stdout: Path | None = None) -> str:
    result = subprocess.run(parts, cwd=cwd, env=env, text=True, capture_output=True)
    if result.returncode:
        detail = (result.stderr or result.stdout).strip()
        raise RuntimeError(detail[-1800:] or f"{Path(parts[1]).name} exited {result.returncode}")
    if stdout is not None:
        stdout.write_text(result.stdout, encoding="utf-8")
    return result.stdout


def optional_step(parts: list[str], *, cwd: Path, env: dict[str, str],
                  stdout: Path | None = None) -> str:
    """Extra evidence, never a gate.

    These steps need a key the member may not have bought, or a browser that may
    not be installed. A run that already cost money must not die because one of
    them is missing, and the report simply leaves out what was not measured.
    """
    try:
        return command(parts, cwd=cwd, env=env, stdout=stdout)
    except (RuntimeError, OSError) as error:
        print(f"skipped {Path(parts[1]).stem}: {str(error)[:200]}", file=sys.stderr)
        return ""


def get_job(job_id: str, env: dict[str, str]) -> dict:
    raw = command([sys.executable, str(ROOT / "code" / "pipeline.py"), "get", job_id], cwd=ROOT, env=env)
    value = json.loads(raw)
    if not isinstance(value, dict):
        raise RuntimeError("The pipeline did not return one lead.")
    return value


def normalise_website(value: str) -> tuple[str, str]:
    parsed = urlparse(value.strip())
    host = (parsed.hostname or "").casefold().removeprefix("www.")
    if parsed.scheme != "https" or not host or "." not in host or parsed.username or parsed.password:
        raise RuntimeError("Save the business's public HTTPS website before running the audit.")
    return value.strip(), host


def profile_domain(profile: dict) -> str:
    value = str(profile.get("website") or "").strip()
    if not value:
        return ""
    parsed = urlparse(value if "://" in value else f"https://{value}")
    return (parsed.hostname or "").casefold().removeprefix("www.")


def validate_profile(profile: dict, expected_domain: str) -> None:
    actual = profile_domain(profile)
    if actual != expected_domain:
        raise RuntimeError(
            f"The confirmed Google profile links to {actual or 'no website'}, not {expected_domain}. Nothing was audited."
        )
    if not profile.get("place_id") or not profile.get("coordinate") or not profile.get("name"):
        raise RuntimeError("The exact Google profile needs a place ID, coordinates and business name.")


def validate_site(path: Path) -> dict:
    site = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(site, dict) or not isinstance(site.get("pages"), list) or not site["pages"]:
        raise RuntimeError("The website pull returned no reachable pages.")
    return site


def profile_location(profile: dict) -> str:
    city = str(profile.get("city") or "").strip()
    country = str(profile.get("country") or "").strip()
    address = str(profile.get("address") or "").strip()
    if not country and address:
        parts = [part.strip() for part in address.split(",") if part.strip()]
        if len(parts) > 1:
            country = parts[-1]
    if not city or not country:
        raise RuntimeError(
            "The confirmed Google profile did not provide a city and country. Save its exact place ID or check the profile."
        )
    return f"{city}, {country}"


def jobs_dir(env: dict[str, str]) -> Path:
    return Path(env.get("BLUEPRINT_JOBDIR") or ROOT / "jobs")


def missing_credentials(env: dict[str, str]) -> list[str]:
    return [" or ".join(group) for group in REQUIRED_KEYS
            if not any(str(env.get(name) or "").strip() for name in group)]


def artifact_is_current(path: Path, source_updated_at: str) -> bool:
    if not path.is_file() or not source_updated_at:
        return False
    try:
        source_time = dt.datetime.fromisoformat(source_updated_at.replace("Z", "+00:00"))
        return path.stat().st_mtime >= source_time.timestamp()
    except (OSError, ValueError):
        return False


def run(job_id: str, *, dry_run: bool = False) -> Path | None:
    if not ID.fullmatch(job_id):
        raise RuntimeError("Use the numeric Upwork job ID.")
    env = dict(os.environ)
    load_env(ROOT / ".env", env)
    load_env(Path.home() / ".config" / "credentials.env", env)
    env["BLUEPRINT_ROOT"] = str(ROOT)
    job = get_job(job_id, env)
    source = job.get("lead_magnet_source")
    if not isinstance(source, dict):
        raise RuntimeError("Save the business website first: /lead-magnet <job id> <website>.")
    website, domain = normalise_website(str(source.get("website") or ""))
    saved_location = str(source.get("location") or "").strip()
    missing = missing_credentials(env)
    if dry_run:
        print(json.dumps({
            "job": job_id,
            "website": website,
            "location": "derived from the confirmed Google profile",
            "paid_services": ["Firecrawl", "Apify", "DataForSEO"],
            "missing_credentials": missing,
            "would_send_or_publish": False,
            "production_run_publishes": False,
        }))
        return None
    folder = jobs_dir(env) / job_id
    final = folder / "lead-magnet.html"
    if artifact_is_current(final, str(job.get("lead_magnet_source_updated_at") or "")):
        print(json.dumps({"report": str(final), "published": False,
                          "reused_existing_audit": True, "sent": False}))
        return final
    if missing:
        raise RuntimeError(f"Add {', '.join(missing)} to .env before starting the paid audit.")
    runtime_problem = runtime_error(env)
    if runtime_problem:
        raise RuntimeError(runtime_problem)
    command([sys.executable, str(ROOT / "code" / "preflight.py"), "lead-magnet"], cwd=ROOT, env=env)

    folder.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    stage = folder / f".lead-magnet-build-{stamp}"
    stage.mkdir(mode=0o700)
    env["BLUEPRINT_METRICS_DIR"] = str(stage)
    profile_file = stage / "gbp-profile.json"
    profile_args = [sys.executable, str(ROOT / "code" / "lead_magnet_gbp.py")]
    place_id = str(source.get("place_id") or "").strip()
    if place_id:
        profile_args.extend(["--place-id", place_id])
    else:
        profile_args.extend(["--discover-domain", domain])
        if saved_location:
            profile_args.extend(["--location", saved_location])
    command(profile_args, cwd=ROOT, env=env, stdout=profile_file)
    profile = json.loads(profile_file.read_text(encoding="utf-8"))
    validate_profile(profile, domain)

    # An empty hours field in the API does not mean the business keeps no hours.
    # A cold audit once told an owner their profile showed none, and the answer
    # was "it is 24/7". So when the field is empty, read the page a customer sees.
    place_id = place_id or str(profile.get("place_id") or "").strip()
    if not profile.get("opening_hours") and place_id:
        hours_file = stage / "hours.json"
        optional_step([sys.executable, str(ROOT / "code" / "lead_magnet_hours.py"),
                       "--place-id", place_id], cwd=ROOT, env=env, stdout=hours_file)
        if hours_file.is_file():
            hours = json.loads(hours_file.read_text(encoding="utf-8") or "{}")
            # Only `status` is safe to read: `found` is false both when the page
            # shows no hours and when the page could not be read at all.
            profile["hours_public_status"] = str(hours.get("status") or "unverified")
            if profile["hours_public_status"] == "found" and hours.get("text"):
                profile["opening_hours"] = [str(hours["text"])]
            profile_file.write_text(json.dumps(profile, ensure_ascii=False), encoding="utf-8")

    location = profile_location(profile)

    collect_args = [
        sys.executable, str(ROOT / "code" / "lead_magnet_collect.py"),
        "--url", website,
        "--domain", domain,
        "--business", str(profile["name"]),
        "--location", location,
        "--language", str(source.get("language") or "English"),
        "--market", "local",
        "--coordinate", str(profile["coordinate"]),
        "--auto-grid",
        "--outdir", str(stage),
    ]
    if profile.get("country_code"):
        collect_args.extend(["--country-code", str(profile["country_code"])])
    # The on-page checks judge the title and headline against the town this
    # business actually serves and the words of its Google category, and compare
    # the postcode on the page with the one on the profile. Without these the
    # checks still run, but against nothing.
    for flag, key in (("--town", "city"), ("--category", "category"), ("--address", "address")):
        if profile.get(key):
            collect_args.extend([flag, str(profile[key])])
    command(collect_args, cwd=ROOT, env=env)
    for name in ("cro.json", "site.json", "search.json", "keyword-cache.json", "gbp-profile.json"):
        target = stage / name
        if not target.is_file() or target.stat().st_size < 20:
            raise RuntimeError(f"The paid run did not produce complete {name}. Evidence remains in {stage.name}.")
    try:
        validate_site(stage / "site.json")
    except (RuntimeError, OSError, ValueError, json.JSONDecodeError) as error:
        raise RuntimeError(f"{error} Evidence remains in {stage.name}.") from error

    # Two more measurements the report shows when they exist: what the lowest
    # reviews complain about, and whether AI search names this business at all.
    # Both need OPENAI_API_KEY, the first also needs Apify, and neither is worth
    # failing a paid run over.
    if place_id:
        ident = ["--run-id", stamp, "--place-id", place_id, "--out-dir", str(stage)]
        reviews = [sys.executable, str(ROOT / "code" / "lead_magnet_reviews.py"), *ident]
        optional_step(reviews, cwd=ROOT, env=env)
        optional_step([*reviews, "--stage", "themes"], cwd=ROOT, env=env)
        grid = json.loads((stage / "search.json").read_text(encoding="utf-8")).get("geoGrid") or {}
        keyword = str(grid.get("keyword") or "").strip()
        if keyword:
            optional_step([sys.executable, str(ROOT / "code" / "lead_magnet_ai.py"), *ident,
                           "--keyword", keyword, "--city", location,
                           "--country-code", str(profile.get("country_code") or ""),
                           "--domain", domain, "--name", str(profile["name"])],
                          cwd=ROOT, env=env)

    report_tmp = folder / f".lead-magnet-{stamp}.html.tmp"
    command([
        sys.executable, str(ROOT / "code" / "lead_magnet_render.py"),
        "--business", str(profile["name"]),
        "--evidence", str(stage),
        "--output", str(report_tmp),
        "--measured-at", dt.date.today().isoformat(),
        "--location", location,
    ], cwd=ROOT, env=env)
    page = report_tmp.read_text(encoding="utf-8")
    # The label, not a sentence: the shell renders it as the closing button and the
    # full stop that used to follow it went with the old shell.
    if page.count('data-audit-section="') != 3 or "Reply here on Upwork" not in page:
        raise RuntimeError(f"Report validation failed. Evidence remains in {stage.name}.")
    report_tmp.replace(final)
    evidence_root = folder / "lead-magnet-data"
    evidence_root.mkdir(exist_ok=True)
    stage.rename(evidence_root / stamp)
    print(json.dumps({"report": str(final), "evidence": str(evidence_root / stamp), "sent": False,
                      "published": False}))
    return final


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("job_id")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        run(args.job_id, dry_run=args.dry_run)
    except (RuntimeError, OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Lead magnet stopped: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
