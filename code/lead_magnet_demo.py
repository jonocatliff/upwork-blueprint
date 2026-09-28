#!/usr/bin/env python3
"""Generate a fictional, self-contained lead-magnet example for a pitch page."""

from __future__ import annotations

import argparse
import datetime as dt
import re
from pathlib import Path

from lead_magnet_cro import ELEMENTS
from lead_magnet_render import render


def example_evidence(business: str, service: str, conversion: str) -> tuple[dict, dict, dict]:
    category = business.removeprefix("Example ").strip() or "Service Company"
    service_path = "/" + "-".join(service.lower().split())
    # The example shows every check the engine measures, with its own labels, so a
    # thinner fixture can never make the product look smaller than it is. A decent
    # site has the first nine; the ones after that are the usual gaps.
    present_keys = {key for key, _, _ in ELEMENTS[:9]} | {"onpage_title", "email_capture"}
    cro = {
        "url": "",
        "elements": [
            {
                "key": key,
                "label": label,
                "present": key in present_keys,
                "applies": True,
                "consequence": consequence,
            }
            for key, label, consequence in ELEMENTS
        ],
        "speed": {"ok": True, "scores": {"performance": 61, "seo": 92, "accessibility": 84},
                  "lcp": "5.2 s", "desktopScreenshot": "",
                  "note": "Mobile measurement of the home page."},
    }
    search = {
        "geoGrid": {
            "keyword": service,
            "ranks": [1, 2, 8, 12, None] * 5,
            "requestedPoints": 25,
            "checkedPoints": 25,
            "winners": [
                {"name": f"Northside {category}", "topThreePoints": 18, "bestRank": 1, "rating": 4.8, "reviews": 127},
                {"name": f"City {category}", "topThreePoints": 11, "bestRank": 2, "rating": 4.7, "reviews": 84},
            ],
            "client": {"topThreePoints": 10, "averageRank": 6.2, "rating": 4.6, "reviews": 42},
        },
        "gbp": {
            "profile": {
                "name": business,
                "category": category,
                "city": "Example market",
                "rating": 4.6,
                "reviews": 42,
                "description": f"{business} provides {service} across the local area.",
                "photos": 18,
            },
            "auditRows": [
                {"label": "Claimed", "value": "The profile is claimed and managed.", "status": "good"},
                {"label": "Address", "value": "A full street address is public.", "status": "good"},
                {"label": "Phone", "value": "A public phone is listed.", "status": "good"},
                {"label": "Website", "value": "The profile links to the home page, not to the service page.", "status": "warn"},
                # Google allows one primary category and nine more, and the advice beside this row
                # says so, so the example may not say three: a client reading both at once sees
                # the report contradict itself on the one page that is meant to prove care.
                {"label": "Categories", "value": f"One category is set, {category}. Nine more slots are empty.", "status": "warn"},
                {"label": "Services", "value": "No service list is public, so the profile never names what is sold.", "status": "bad"},
                {"label": "Description", "value": "The description names the service and the area it covers.", "status": "good"},
                {"label": "Photos", "value": "18 public photos, the newest from last year.", "status": "warn"},
                {"label": "Hours", "value": "The public hours are Monday to Friday, 8 to 17.", "status": "good"},
                {"label": "Attributes", "value": "No attributes are set, so filters like 'on-site services' never match.", "status": "bad"},
                {"label": "Booking link", "value": "No booking link was found.", "status": "bad"},
                {"label": "Reviews", "value": "42 Google reviews with an average rating of 4.6 stars; the newest is four months old.", "status": "warn"},
                {"label": "Updates", "value": "No recent update was found.", "status": "warn"},
            ],
        },
    }
    site = {
        "pages": [
            {"path": "/", "title": "Homepage"},
            {"path": service_path, "title": service.title()},
            {"path": "/contact", "title": conversion.title()},
        ]
    }
    return cro, search, site


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    parser.add_argument("--business", default="Example Roofing")
    parser.add_argument("--service", default="roof repair")
    parser.add_argument("--location", default="Austin, Texas")
    parser.add_argument("--conversion", default="estimate request")
    args = parser.parse_args()

    cro, search, site = example_evidence(args.business, args.service, args.conversion)
    page = render(
        args.business,
        cro,
        search,
        dt.date.today().isoformat(),
        args.location,
        site,
    )
    page = page.replace("Private website audit", "Example website audit")
    if re.search(r'(?:src|href|action)\s*=\s*["\']https?://', page, flags=re.I):
        raise RuntimeError("demo report reaches out to an external address")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(page, encoding="utf-8")
    print(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
