#!/usr/bin/env python3
"""Opening hours as a customer sees them: read from the rendered Google page.

    python3 code/lead_magnet_hours.py --place-id ChIJ... [--language en]

An empty API field is not a finding. A cold mail once told a business its profile
showed no opening hours, and the reply was "it's 24/7" - the correction, not the
confirmation. Measured 21 September 2026 on that same place id:

    Apify, export of 20 September   empty
    Apify, live run 21 September    empty
    DataForSEO Maps, same place id  null
    the Google page in a browser    Open 24 hours

Both APIs read the same data layer and it carries no hours table for that
listing, while the display comes from an attribute only the rendered page shows.
An empty field is therefore not a finding but a not-knowing, and in one database
of 300 rows it was empty for 112.

This module is the source that knows. Cost: no service is asked, no key is
needed, and nothing is charged; only browser time, about ten seconds through
Playwright and fifteen through the Chrome fallback, which has to be stopped
rather than waited for (measured 27 September 2026). Playwright is used when it
is installed, otherwise headless Chrome. Only Playwright can click a consent
dialog away: where Google shows one, Chrome reports "unverified" instead of
pretending the hours are absent.

Output (JSON):
    {"place_id": ..., "status": "found", "found": true, "text": "Open 24 hours",
     "open_24_hours": true, "rendered_at": "...", "engine": "playwright"}

`status` is the only field a report may act on:
    found        the page shows hours, and `text` is the line it shows
    not_found    the page showed none, and only now may a report say they are missing
    unverified   no browser, or the read failed; `error` names it and nothing is claimed

The CLI always exits 0 and never raises: an unreadable page is missing evidence,
not a failed run, and a caller that only checked an exit code would otherwise
publish "no hours" as a measurement.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
from html import unescape
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

# What Google writes in the side panel, in every form we have seen. "Open 24
# hours" stands there even when the API carries no day rows at all.
HOURS_LINE = re.compile(
    r"(open 24 hours|opens? \d|closes? \d|closed\b"
    "|24 stunden ge\u00f6ffnet|\u00f6ffnet \\d|schlie\u00dft \\d|geschlossen\\b)",  # multilingual-data
    re.I)
ALL_DAY = re.compile(
    r"open 24 hours"
    "|24 stunden",  # multilingual-data
    re.I)
# The consent dialog otherwise stands in front of the side panel.
CONSENT_BUTTONS = ("Accept all", "Alle akzeptieren", "I agree", "Ich stimme zu", "Reject all")  # multilingual-data
CONSENT_WALL = re.compile(
    r"before you continue|consent\.google\.com|accept all"
    "|bevor sie fortfahren|alle akzeptieren",  # multilingual-data
    re.I)
# Chrome prints the DOM and keeps running, so this is how long the fallback waits
# before it stops the browser and reads what was printed.
CHROME_WAIT_S = 15
NO_BROWSER = ("no browser to render the page; install Playwright "
              "(python3 -m pip install playwright && python3 -m playwright install chromium) "
              "or Google Chrome")


def chrome_binary() -> str | None:
    candidates = [
        os.environ.get("CHROME_BIN"),
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ]
    return next((str(path) for path in candidates if path and Path(path).is_file()), None)


def page_url(place_id: str, language: str) -> str:
    return f"https://www.google.com/maps/place/?q=place_id:{place_id}&hl={language}"


def text_from_dom(html: str) -> str:
    """The visible text of a dumped DOM, close enough to what a browser lays out."""
    body = re.sub(r"(?is)<(script|style|template|noscript)[^>]*>.*?</\1>", " ", html)
    broken = re.sub(r"(?i)<(br|/p|/div|/li|/h[1-6]|/tr|/td|/span|/button)[^>]*>", "\n", body)
    plain = unescape(re.sub(r"(?s)<[^>]+>", " ", broken))
    return "\n".join(" ".join(line.split()) for line in plain.splitlines())


def hours_from_text(text: str) -> dict:
    """What the rendered page says about hours, or that it said nothing."""
    hit = HOURS_LINE.search(text or "")
    if not hit:
        return {"found": False, "text": "", "open_24_hours": False,
                "consent_wall": bool(CONSENT_WALL.search(text or ""))}
    line = next((row.strip() for row in text.splitlines() if HOURS_LINE.search(row)), hit.group(0))
    return {"found": True, "text": line[:120],
            "open_24_hours": bool(ALL_DAY.search(line)), "consent_wall": False}


def read_with_playwright(url: str, timeout_s: int) -> tuple[str, str]:
    """The page text, or the reason there is none. Clicks the consent dialog away."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return "", "Playwright is not installed"
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(
                viewport={"width": 1400, "height": 1000},
                user_agent=("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"))
            page.goto(url, wait_until="domcontentloaded", timeout=timeout_s * 1000)
            page.wait_for_timeout(3500)
            for label in CONSENT_BUTTONS:
                button = page.query_selector(f'button:has-text("{label}")')
                if button:
                    try:
                        button.click()
                        page.wait_for_timeout(3000)
                    except Exception:  # noqa: BLE001 - a click that misses is not a failure
                        pass
                    break
            page.wait_for_timeout(3500)
            text = page.evaluate("() => document.body.innerText") or ""
            browser.close()
    except Exception as error:  # noqa: BLE001 - without a page there is no verdict
        return "", str(error)[:200]
    return text, ""


def read_with_chrome(url: str, timeout_s: int) -> tuple[str, str]:
    """The page text from headless Chrome. It cannot click a consent dialog away."""
    browser = chrome_binary()
    if not browser:
        return "", "Chrome is not installed"
    with tempfile.TemporaryDirectory(prefix="lead-magnet-hours-") as profile:
        command = [browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                   "--window-size=1400,1000", f"--user-data-dir={profile}",
                   "--virtual-time-budget=12000", "--dump-dom", url]
        try:
            process = subprocess.Popen(command, stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE, text=True)
        except OSError as error:
            return "", f"Chrome did not start: {str(error)[:160]}"
        try:
            dom, problem = process.communicate(timeout=min(timeout_s, CHROME_WAIT_S))
        except subprocess.TimeoutExpired:
            # Headless Chrome prints the whole DOM and then keeps running, so the
            # dump arrives long before the wait runs out. What it printed is the
            # page; stopping the browser is how this read ends, not a failure.
            process.kill()
            dom, problem = process.communicate()
    if "</html>" not in (dom or "").casefold():
        detail = " ".join((problem or "").split())[:160]
        return "", f"Chrome returned no page{f': {detail}' if detail else '.'}"
    return text_from_dom(dom), ""


def read_hours(place_id: str, language: str = "en", timeout_s: int = 45) -> dict:
    """The rendered hours for one confirmed place id, with the engine that read them."""
    result = {"place_id": place_id, "status": "unverified", "found": False, "text": "",
              "open_24_hours": False,
              "rendered_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
              "engine": None}
    url = page_url(place_id, language)
    reasons = []
    for engine, reader in (("playwright", read_with_playwright), ("chrome", read_with_chrome)):
        text, reason = reader(url, timeout_s)
        if reason:
            reasons.append(f"{engine}: {reason}")
            continue
        found = hours_from_text(text)
        result.update(engine=engine, found=found["found"], text=found["text"],
                      open_24_hours=found["open_24_hours"])
        if found["found"]:
            result["status"] = "found"
        elif found["consent_wall"]:
            result["status"] = "unverified"
            result["error"] = ("the consent page stood in front of the listing; "
                               "install Playwright to click it away")
        else:
            result["status"] = "not_found"
        return result
    # Nothing installed is a setup gap with a fix; a browser that failed is its own story.
    result["error"] = (NO_BROWSER if all("is not installed" in reason for reason in reasons)
                       else "; ".join(reasons))
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--place-id", required=True)
    parser.add_argument("--language", default="en")
    args = parser.parse_args()
    result = read_hours(args.place_id, args.language)
    if result["status"] == "unverified":
        print(f"Opening hours not measured: {result.get('error') or NO_BROWSER}", file=sys.stderr)
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
