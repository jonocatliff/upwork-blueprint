#!/usr/bin/env python3
"""Pull the search, map grid, and Business Profile evidence for a lead magnet."""
from __future__ import annotations

import argparse
import base64
import datetime as dt
import io
import json
import math
import os
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlparse

try:
    from lead_magnet_instrument import count_call, record_cost
except ModuleNotFoundError:  # importlib-based local tests do not add this folder to sys.path
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from lead_magnet_instrument import count_call, record_cost
from lead_magnet_workspace import workspace_root

ROOT = workspace_root()
API = "https://api.dataforseo.com/v3"

# Diagnostics about our own calls, kept apart from `missing`, which only ever
# holds findings about the client.
LABS_PROBLEMS: list[str] = []

def creds() -> tuple[str, str]:
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("DATAFORSEO_LOGIN="):
                os.environ.setdefault("DATAFORSEO_LOGIN", line.split("=", 1)[1])
            if line.startswith("DATAFORSEO_PASSWORD="):
                os.environ.setdefault("DATAFORSEO_PASSWORD", line.split("=", 1)[1])
    login, pw = os.environ.get("DATAFORSEO_LOGIN"), os.environ.get("DATAFORSEO_PASSWORD")
    if not login or not pw:
        sys.exit("DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD missing from .env")
    return login, pw


def authorization() -> str:
    """Return one verbatim Authorization value when a hosted vault supplies it.

    Managed-agent vault values are substituted only at network egress. Encoding
    separate placeholder credentials would destroy that substitution, so hosted
    runs inject the already-encoded header as DATAFORSEO_AUTHORIZATION.
    """
    header = os.environ.get("DATAFORSEO_AUTHORIZATION")
    if header:
        return header
    login, pw = creds()
    token = base64.b64encode(f"{login}:{pw}".encode()).decode()
    return f"Basic {token}"


def post(path: str, body: list[dict]) -> dict:
    count_call(path, tasks=len(body))
    req = urllib.request.Request(
        f"{API}/{path}", data=json.dumps(body).encode(),
        headers={"Authorization": authorization(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            response = json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"{path} failed: HTTP {e.code} {e.read().decode('utf-8', 'replace')[:300]}")
    reported_cost = response.get("cost")
    if reported_cost is None:
        reported_cost = sum(float(task.get("cost") or 0) for task in response.get("tasks") or [])
    record_cost(path, reported_cost)
    return response


LABS_LOCALE: dict[str, tuple[str, str]] = {}


def labs_locale(location: str, language: str, get_call: Callable | None = None) -> tuple[str, str]:
    """The country and language Labs actually has for this business.

    Measured 27 September 2026: `dataforseo_labs/locations_and_languages` holds 94
    locations, every one a country, and Germany offers exactly one language,
    German. A town is refused with `Invalid Field: 'location_name'` and a language
    the country does not carry with `Invalid Field: 'language_name'`, both after
    the website pulls have been paid for. The list itself is free, so it is read
    first.

    The report's own language is a separate decision and is not changed here. This
    only settles what the keyword endpoints can be asked.
    """
    country = (location or "").split(",")[-1].strip() or (location or "").strip()
    wanted = (language or "").strip()
    key = f"{country}|{wanted}"
    if key in LABS_LOCALE:
        return LABS_LOCALE[key]
    payload = (get_call or get)("dataforseo_labs/locations_and_languages")
    rows = ((payload.get("tasks") or [{}])[0].get("result") or [])
    entry = next((row for row in rows
                  if str(row.get("location_name", "")).casefold() == country.casefold()), None)
    if entry is None:
        known = ", ".join(sorted(str(row.get("location_name")) for row in rows)[:6])
        raise RuntimeError(
            f"keyword data is not available for {country!r}. DataForSEO Labs covers "
            f"{len(rows)} countries, for example {known}.")
    available = [str(item.get("language_name")) for item in entry.get("available_languages") or []]
    chosen = next((name for name in available if name.casefold() == wanted.casefold()),
                  available[0] if available else "")
    if not chosen:
        raise RuntimeError(f"DataForSEO Labs lists no language for {country}.")
    LABS_LOCALE[key] = (country, chosen)
    return country, chosen



def get(path: str) -> dict:
    """Authenticated DataForSEO GET, used for free taxonomy endpoints."""
    count_call(path, tasks=0)
    req = urllib.request.Request(
        f"{API}/{path}", headers={"Authorization": authorization(),
                                  "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            return json.loads(response.read())
    except urllib.error.HTTPError as error:
        sys.exit(f"{path} failed: HTTP {error.code} "
                 f"{error.read().decode('utf-8', 'replace')[:300]}")


def normalise_domain(value: str | None) -> str:
    """Return one comparable host without guessing from a business name."""
    if not value:
        return ""
    candidate = value.strip().lower()
    parsed = urlparse(candidate if "://" in candidate else f"//{candidate}")
    host = parsed.hostname or candidate.split("/", 1)[0].split(":", 1)[0]
    return host.removeprefix("www.").rstrip(".")


def is_client_map_item(
    item: dict, business: str | None, domain: str,
    client_place_id: str | None = None, client_cid: str | int | None = None,
) -> bool:
    """Use the confirmed listing ID; a shared website is not a listing ID."""
    if client_place_id:
        return str(item.get("place_id") or "") == str(client_place_id)
    if client_cid is not None:
        return str(item.get("cid") or "") == str(client_cid)
    title = " ".join(str(item.get("title") or "").casefold().split())
    name = " ".join(str(business or "").casefold().split())
    if name:
        return title == name
    return bool(domain and normalise_domain(item.get("domain") or item.get("url")) == normalise_domain(domain))


def is_rankable_map_listing(item: dict) -> bool:
    """Count only identifiable, organic listings in the Maps response."""
    listing_type = item.get("type")
    if listing_type and listing_type != "maps_search":
        return False
    return not listing_type or bool(item.get("cid") or item.get("place_id"))


def parse_grid_tasks(
    grid_response: dict,
    business: str | None,
    domain: str,
    expected: int = 25,
    client_place_id: str | None = None,
    client_cid: str | int | None = None,
) -> tuple[list[int | None], list[dict]]:
    """Preserve grid order and reuse the centre task for review evidence."""
    ranks: list[int | None] = []
    centre_items: list[dict] = []
    tasks = grid_response.get("tasks") or []
    for index in range(expected):
        task = tasks[index] if index < len(tasks) else {}
        items = ((task.get("result") or [{}])[0].get("items") or [])
        if index == expected // 2:
            centre_items = items
        found = None
        for item in items:
            if not is_rankable_map_listing(item):
                continue
            if is_client_map_item(item, business, domain, client_place_id, client_cid):
                found = item.get("rank_group")
                break
        ranks.append(found)
    return ranks, centre_items


def grid_summary(
    grid_response: dict,
    business: str | None,
    domain: str,
    client_cid: str | int | None = None,
    expected: int = 25,
    profile_reviews: int | None = None,
    profile_rating: float | None = None,
    centre_lat: float | None = None,
    centre_lng: float | None = None,
    client_place_id: str | None = None,
) -> dict:
    """Per point: who holds the top three. Across points: who wins the map.

    The winners are the competitors a customer meets first; the client block
    is the same measure for the business itself. Both come from the grid
    responses already paid for, nothing extra is fetched.
    """
    tasks = grid_response.get("tasks") or []
    points: list[dict] = []
    tally: dict[str, dict] = {}
    domain_locations: dict[str, set[str]] = {}
    client_ranks: list[int] = []
    client_top3 = 0
    client_rating = None
    client_reviews = None

    def distance_km(item: dict) -> float | None:
        """Straight-line distance from the client to one Maps result.

        The map response already carries both coordinates, so this adds no
        request and uses the same haversine measure as local-comparison.
        """
        lat, lng = item.get("latitude"), item.get("longitude")
        if None in (centre_lat, centre_lng, lat, lng):
            return None
        try:
            p1, p2 = math.radians(float(centre_lat)), math.radians(float(lat))
            delta_lat = p2 - p1
            delta_lng = math.radians(float(lng) - float(centre_lng))
        except (TypeError, ValueError):
            return None
        km = 6371 * 2 * math.asin(math.sqrt(
            math.sin(delta_lat / 2) ** 2
            + math.cos(p1) * math.cos(p2) * math.sin(delta_lng / 2) ** 2
        ))
        return round(km, 1)
    for index in range(expected):
        task = tasks[index] if index < len(tasks) else {}
        items = [item for item in ((task.get("result") or [{}])[0].get("items") or [])
                 if item.get("title") and is_rankable_map_listing(item)]
        top = []
        top_ids = []
        seen_top: set[str] = set()
        rank = None
        for item in items:
            title = str(item.get("title") or "")
            cid = item.get("cid")
            is_client = is_client_map_item(item, business, domain, client_place_id, client_cid)
            position = item.get("rank_group")
            if is_client and rank is None and position:
                rank = position
                rating = item.get("rating") or {}
                client_rating = rating.get("value", client_rating)
                client_reviews = rating.get("votes_count", client_reviews)
            if position and position <= 3 and not is_client:
                key = str(cid or item.get("place_id") or title.casefold())
                if key in seen_top:
                    continue
                seen_top.add(key)
                rating = item.get("rating") or {}
                winner_domain = normalise_domain(item.get("domain") or item.get("url")) or None
                if winner_domain and cid is not None:
                    domain_locations.setdefault(winner_domain, set()).add(str(cid))
                entry = tally.setdefault(key, {
                    "name": title, "cid": cid, "topThreePoints": 0, "bestRank": None,
                    "rating": rating.get("value"), "reviews": rating.get("votes_count") or 0,
                    # Google's primary category of the winner, for the mirror
                    # check against the client's exact public profile.
                    "category": item.get("category") or None,
                    # The winner's website, so its normal-search standing can
                    # be measured beside the client's.
                    "domain": winner_domain,
                    # Proximity explains why this is a local rival; visibility
                    # across the grid still decides who makes the list.
                    "distanceKm": distance_km(item),
                    # Keep the coordinates already returned by the paid Maps
                    # call. The report can then place the compared listings on
                    # the same map without another lookup.
                    "latitude": item.get("latitude"),
                    "longitude": item.get("longitude"),
                })
                entry["topThreePoints"] += 1
                entry["bestRank"] = position if entry["bestRank"] is None else min(entry["bestRank"], position)
                top.append(title)
                top_ids.append({"cid": cid, "placeId": item.get("place_id"), "name": title, "rank": position})
        if rank is not None:
            client_ranks.append(rank)
            if rank <= 3:
                client_top3 += 1
        points.append({
            "rank": rank, "top": top[:3], "topIds": top_ids[:3],
            "coordinate": (task.get("data") or {}).get("location_coordinate"),
            "status": task.get("status_code"),
        })
    ranked = sorted(tally.values(), key=lambda row: (-row["topThreePoints"], row["bestRank"] or 99, -(row["reviews"] or 0)))
    for row in ranked:
        # A shared domain on two distinct Google listings inside this one grid
        # is direct evidence of a multi-location business. A large website on
        # its own is not: it may still belong to one independent operator.
        winner_domain = row.get("domain")
        # Three locations and up counts as a chain, the same cutoff the report
        # renderer applies.
        row["isChain"] = bool(winner_domain and len(domain_locations.get(winner_domain, set())) > 2)
    winners = ranked[:3]
    # How deep the market is, not only who leads it. Twenty-five of twenty-five
    # reads as dominance until you know the whole map holds three businesses;
    # the number was tallied and then thrown away in the original audit tests.
    return {
        "points": points,
        "winners": winners,
        # Keep the complete measured field. The report shows only the first
        # three by default, but a disclosure names every omitted listing and
        # explains the cutoff. Without the counts, a reader cannot tell whether
        # a fourth listing tied the visible third one.
        "competitors": ranked,
        "rivals": len(ranked),
        "rivalsNamed": [row["name"] for row in ranked],
        "client": {
            "topThreePoints": client_top3,
            "averageRank": round(sum(client_ranks) / len(client_ranks), 1) if client_ranks else None,
            # Client reviews come from the profile attached to the confirmed
            # place ID. The map returns its own count alongside, and the two can
            # differ: the difference is real, its cause is not established. So
            # the map count is only a cross-check for the client, while it
            # remains the only available source for competitors.
            "rating": profile_rating if profile_rating is not None else client_rating,
            "reviews": profile_reviews if profile_reviews is not None else client_reviews,
            "mapRating": client_rating,
            "mapReviews": client_reviews,
            "listingMismatch": bool(
                profile_reviews and client_reviews
                and max(profile_reviews, client_reviews) > 2 * max(1, min(profile_reviews, client_reviews))
            ),
        },
    }


def validated_grid_tasks(
    responses: list[tuple[dict, str | None]],
    expected_points: list[dict] | None = None,
) -> tuple[list[dict], float, list[str]]:
    """Accept a successful empty SERP; reject unavailable or misplaced points."""
    if len(responses) != 25:
        raise RuntimeError(f"The map grid returned {len(responses)} of 25 required checks; it was not scored.")
    tasks: list[dict] = []
    failures: list[str] = []
    spend = 0.0
    for index, (response, transport_problem) in enumerate(responses):
        spend += float(response.get("cost") or 0)
        available = response.get("tasks") or []
        task = available[0] if available else {}
        status = task.get("status_code") if task else None
        requested = expected_points[index] if expected_points is not None else None
        echoed = task.get("data") or {}
        # Measured 23 September 2026: the Maps endpoint returned 40102 at the
        # confirmed centre while normal search returned six local listings. An
        # API non-result is not evidence that the lead missed the Maps top three.
        if transport_problem or not task or status != 20000:
            reason = transport_problem or task.get("status_message") or "missing task result"
            failures.append(f"point {index + 1}: {reason}")
        elif requested is not None and (
            echoed.get("location_coordinate") != requested.get("location_coordinate")
            or echoed.get("keyword") != requested.get("keyword")
        ):
            failures.append(f"point {index + 1}: returned query or coordinate differs from request")
        tasks.append(task)
    if failures:
        raise RuntimeError(
            f"{len(failures)} of {len(responses)} map checks failed; "
            f"the grid was not scored ({failures[0]}); "
            f"provider-reported cost ${spend:.3f}"
        )
    return tasks, spend, failures


def fetch_grid_point(
    point: dict,
    call=None,
) -> tuple[dict, str | None]:
    """Make exactly one paid grid request and return its transport result."""
    call = call or post
    try:
        return call("serp/google/maps/live/advanced", [point]), None
    except (SystemExit, urllib.error.URLError, TimeoutError, ConnectionError,
            json.JSONDecodeError) as error:
        return {"tasks": []}, str(error)[:160]
    except Exception as error:                              # noqa: BLE001
        return {"tasks": []}, str(error)[:160]







def review_activity(profile: dict, today: dt.date | None = None) -> dict:
    """Recency and owner replies from the newest reviews already fetched.

    The spec's review layer asks for both; the stored sample is the newest handful
    (Apify returns them newest first), so "none in 90 days" is a real finding
    while a full count is not claimed.
    """
    today = today or dt.date.today()
    sample = [item for item in (profile.get("review_items") or []) if isinstance(item, dict)]
    recent = 0
    answered = 0
    dated = 0
    for item in sample:
        when = str(item.get("when") or "")[:10]
        try:
            age = (today - dt.date.fromisoformat(when)).days
            dated += 1
            if age <= 90:
                recent += 1
        except ValueError:
            pass
        if str(item.get("owner_response") or "").strip():
            answered += 1
    return {"sampled": len(sample), "dated": dated, "recent90": recent, "answered": answered}


# These are the audit's operating heuristics, not Google requirements or causal
# claims. Their provenance and limits live in
# `references/lead-magnet.md`, which has to change with this block.
BENCHMARK = {
    "category_slots": 10,        # 1 primary + 9 secondary, spec "Categories"
    "photos_strong": 100,        # audit operating target
    "photos_present": 10,        # below this the profile reads as unattended
    "services_minimum": 30,      # spec "Services": minimum 30
    "services_target": 50,       # spec "Services": 50 to use plus 20 extras
    "description_limit": 750,    # spec "Description": Google's own cap
    "description_hook": 100,     # spec "Description": the "see more" cut
}

# A name that carries the trade or the town is the one edit that costs the
# whole profile rather than a ranking, so it gets its own verdict every time
# (spec "The name verdict, state it either way, every single time").
TRADE_WORDS = (
    "locksmith", "plumber", "plumbing", "electrician", "electrical", "roofer", "roofing",
    "hvac", "heating", "cooling", "cleaner", "cleaning", "towing", "tow", "removals",
    "landscaping", "gardener", "builder", "building", "painter", "painting", "glazier",
    "mechanic", "garage", "dentist", "dental", "chiropractor", "physio", "solicitor",
    "accountant", "removal", "carpet", "pest control", "scaffolding", "flooring",
)
NAME_KEYWORD_MARKERS = ("near me", "best ", "cheap ", "24/7", "24 hour", "no 1", "no.1", "#1")


def name_verdict_row(profile: dict, town: str = "", measured: bool = True) -> tuple:
    """State the business name clean or not, with the risk spelled out."""
    name = str(profile.get("name") or "").strip()
    if not name:
        status = "warn" if measured else "unknown"
        return ("Business name", "The public business name could not be read.", status)
    lowered = name.lower()
    town = str(town or profile.get("city") or "").strip()
    # A locksmith using the word "Locksmith" is normal, not a suspension risk.
    # The name becomes risky only when it adds a location or advertising claim.
    flags = [marker.strip() for marker in NAME_KEYWORD_MARKERS if marker in lowered]
    has_town = bool(town) and town.lower() in lowered
    if has_town:
        flags += [word for word in TRADE_WORDS if word in lowered]
    if not flags and not has_town:
        return ("Business name",
                "The public name shows no obvious added town or sales phrase. Keep the real "
                "registered and signwritten name; adding terms only for rankings can put the "
                "profile at risk.",
                "good")
    parts = []
    if has_town:
        parts.append(f"the town \"{town}\"")
    if flags:
        parts.append("the words " + ", ".join(f"\"{item}\"" for item in list(dict.fromkeys(flags))[:3]))
    return ("Business name",
            f"The public name carries {' and '.join(parts)}. If that is not the registered, "
            f"signwritten name, it is a suspension risk and needs checking before anything else.",
            "warn")


def photos_row(photos, measured: bool = True) -> tuple:
    """Photos against the delivery benchmark, not against a tenth of it."""
    if photos is None:
        status = "warn" if measured else "unknown"
        return ("Photos", "The public photo count could not be verified.", status)
    count = int(photos or 0)
    strong, present = BENCHMARK["photos_strong"], BENCHMARK["photos_present"]
    if count >= strong:
        return ("Photos", f"The profile shows {count} public photos, above the audit benchmark of {strong}.", "good")
    if count >= present:
        return ("Photos", f"The profile shows {count} public photos; the audit benchmark is {strong}.", "warn")
    return ("Photos", f"The profile shows {count} public photos, below the audit benchmark of {strong}.", "bad")


def services_row(services: list, measured: bool = True) -> tuple:
    """Services against the spec's minimum and target, not against zero."""
    count = len(services)
    minimum, target = BENCHMARK["services_minimum"], BENCHMARK["services_target"]
    if not count:
        status = "warn" if measured else "unknown"
        return ("Services", "No public service or offer list was returned.", status)
    if count >= target:
        return ("Services", f"The profile lists {count} public services, meeting the audit benchmark of {target}.", "good")
    if count >= minimum:
        return ("Services", f"The profile lists {count} public services; the audit target is {target}.", "warn")
    return ("Services", f"The profile lists {count} public services, below the audit baseline of {minimum}.", "bad")


def booking_row(profile: dict, measured: bool = True) -> tuple:
    """Report whether the exact public profile exposes a booking route."""
    links = profile.get("booking_links") or profile.get("bookingLinks") or []
    if isinstance(links, str):
        links = [links]
    links = [str(item) for item in links if item]
    if links:
        return ("Booking link", f"Customers can book straight from the profile via {links[0]}.", "good")
    if not measured:
        return ("Booking link", "Booking links were not returned by the profile source.", "unknown")
    return ("Booking link",
            "No booking link is published on the Google profile. Customers may still contact "
            "the business through its website or phone.", "open")


def attributes_row(profile: dict, measured: bool = True) -> tuple:
    """Only what is set is public; what the category offers is dashboard-only."""
    # The lookup nests the real names under `available_attributes`, so reading
    # the top-level keys reported "available_attributes" as an attribute.
    attributes = profile.get("attributes") or {}
    names: list[str] = []
    if isinstance(attributes, dict):
        available = attributes.get("available_attributes")
        source = available if isinstance(available, (dict, list)) else attributes
        if isinstance(source, dict):
            for key, value in source.items():
                if isinstance(value, list):
                    names += [str(item) for item in value if item]
                elif value:
                    names.append(str(key))
        else:
            names += [str(item) for item in source if item]
    else:
        names = [str(item) for item in attributes if item]
    names = sorted({name for name in names if name and not name.endswith("_attributes")})
    if names:
        return ("Attributes",
                f"The profile publishes {len(names)} attributes, including {', '.join(names[:3])}. "
                f"Which further ones this category offers is only visible in the owner's dashboard.",
                "good")
    if not measured:
        return ("Attributes", "Public attributes were not returned by the profile source.", "unknown")
    return ("Attributes",
            "No public attributes were found. The full list this category offers is only visible "
            "in the owner's dashboard, so this one is confirmed together, not audited from outside.",
            # "open" rather than "warn": the report said "visible in the account
            # only" and still deducted points.
            "open")


def reviews_row(profile: dict, measured: bool = True,
                neighbours: list[int] | None = None) -> tuple:
    # The twenty that used to sit here was the last of the numbers this file's
    # own header calls sourceless, and it outlived the fix that removed the
    # other two. The spec sets no pass mark on the count: its review layer
    # grades reviews against three named competitors and on the last 90 days
    # plus the owner's reply rate. The competitor figures are not in this
    # profile, so the count alone is reported and never graded; what IS here
    # decides the verdict. No sample, no verdict: "open" renders as a check and
    # stays out of the profile score.
    if not measured:
        return ("Reviews", "Review count and rating were not returned by the profile source.", "unknown")
    count = profile.get("reviews") or 0
    rating = profile.get("rating") or "not verified"
    value = f"The profile has {count} Google reviews with an average rating of {rating} stars."
    if not count:
        return ("Reviews", "The profile has no Google reviews.", "bad")
    activity = review_activity(profile)
    if not activity["dated"]:
        return ("Reviews", value, "open")
    value += (
        f" Of the {activity['dated']} newest, {activity['recent90']} arrived in the last 90 days"
        f" and {activity['answered']} have an owner reply."
    )
    status = "good" if activity["recent90"] and activity["answered"] else "warn"
    # THE NEIGHBOURS DECIDE, NOT A FIXED NUMBER. Whether 32 reviews are many is
    # known only by the market: beside neighbours with 28 the business leads,
    # beside neighbours with 150 it is invisible. Until now every number read
    # the same, and the report turned a leading business into a case for
    # improvement. The neighbour count is NOT printed in the report; it only
    # decides whether this row is a finding or a statement.
    # CHAINS ARE NOT NEIGHBOURS (measured 21 September 2026). One business with
    # 123 reviews had map neighbours on 154, 764 and 6,174; the last is plainly
    # not a one-person firm in the same town. Measured against it every trade
    # shows red, and the sentence cannot be held up in conversation. The same
    # cutoff as in the history chart: more than twenty times means a different
    # kind of company, not weaker performance.
    raw = sorted(n for n in (neighbours or []) if isinstance(n, int) and n > 0)
    comparable = [n for n in raw if not (count and n > count * 20)] or raw
    if comparable:
        midpoint = comparable[len(comparable) // 2]
        if count >= midpoint:
            # Ahead of the field: that is no shortcoming, whatever the number.
            status = "good"
        elif midpoint and count < midpoint / 2:
            # Less than half the field: that is a finding.
            status = "bad"
    return ("Reviews", value, status)


def gbp_from_summary(profile: dict, fallback_name: str,
                     neighbour_reviews: list[int] | None = None) -> dict:
    """Render GBP evidence from the profile lookup already paid for upstream.

    `neighbour_reviews` are the review counts of the map winners. They appear
    nowhere in the report; they only decide whether the client's own count
    counts as a finding or as a statement.
    """
    categories = profile.get("categories") or []
    photos = profile.get("photos")
    description = profile.get("description") or ""
    services = [str(value) for value in (profile.get("service_items") or []) if value]
    updates = profile.get("owner_updates") or []
    update_count = int(profile.get("owner_update_count") or len(updates))
    rich = bool(profile.get("rich_evidence"))
    measured_fields = set(profile.get("measured_fields") or [])

    def measured(*keys: str) -> bool:
        if measured_fields:
            return any(key in measured_fields for key in keys)
        if rich:
            return any(profile.get(key) not in (None, "", [], {}) for key in keys)
        return any(key in profile for key in keys)

    service_area = bool(profile.get("service_area_business"))
    address_value = (
        "hidden correctly for a service-area business"
        if service_area and not profile.get("address")
        else profile.get("address") or "none listed"
    )
    address_status = (
        "good" if profile.get("address") or service_area
        else "bad" if measured("address", "service_area_business")
        else "unknown"
    )
    hours = profile.get("opening_hours") or []
    hours_value = " · ".join(
        str(item) if isinstance(item, str)
        else f"{item.get('day') or ''} {item.get('hours') or item.get('time') or ''}".strip()
        for item in hours
    )
    hours_public_status = str(profile.get("hours_public_status") or "")
    if hours_value:
        hours_row = ("Hours", f"The public hours are {hours_value}.", "good")
    elif not measured("opening_hours"):
        hours_row = ("Hours", "Opening hours were not returned by the profile source.", "unknown")
    elif hours_public_status == "not_found":
        hours_row = ("Hours", "Opening hours were not captured from the rendered Google page; "
                              "their publication is unverified.", "open")
    else:
        hours_row = ("Hours", "Opening hours could not be verified from the public sources.", "open")
    category_review_candidates = [
        str(category) for category in (profile.get("category_review_candidates") or [])
        if str(category) in categories[1:]
    ]
    limit, hook = BENCHMARK["description_limit"], BENCHMARK["description_hook"]
    town_in_hook = bool(profile.get("city")) and str(profile["city"]).lower() in description[:hook].lower()
    town = str(profile.get("city") or "").strip()
    if not description:
        description_status = "bad" if measured("description") else "unknown"
        description_value = ("No business description is published." if description_status == "bad"
                             else "The business description was not returned by the profile source.")
    elif len(description) > limit:
        description_status = "warn"
        description_value = (f"The public description uses {len(description)} characters, above the "
                             f"audit field-limit check of {limit}.")
    elif town and not town_in_hook:
        description_status = "warn"
        description_value = (f"The public description is {len(description)} characters, but the first {hook} "
                             f"are all a customer sees before \"more\", and they do not say what the "
                             f"business does in {town}.")
    else:
        description_status = "good"
        description_value = (f"The public description explains the business in {len(description)} characters, "
                             f"and the first {hook} carry the point.")
    # Categories are judged against the trade, the way the cold mail does it:
    # slots used out of Google's ten, against the median of the same trade in
    # the same country, with the count of trade categories this profile lacks.
    cohort = profile.get("cohort") or {}
    used_categories = len(categories)
    cohort_median = cohort.get("median_categories")
    missing_trade_categories = [
        item.get("name") for item in (cohort.get("top_categories") or [])
        if item.get("name") and item.get("name") not in categories
    ]
    # The trade median is context, never the verdict. Grading against it told a
    # profile with three of ten slots that it was "in line with the trade", and
    # the offer that followed was to fill the other seven.
    slots = BENCHMARK["category_slots"]
    trade_note = (f" Most businesses of this kind use {cohort_median}." if cohort_median else "")
    missing_note = (f" {len(missing_trade_categories)} categories customers search for are missing "
                    f"and prepared for the working session." if missing_trade_categories else "")
    if category_review_candidates:
        categories_value = (f"The profile lists {', '.join(categories)}. The stored evidence explicitly "
                            f"marks {', '.join(category_review_candidates)} for owner confirmation.")
        categories_status = "warn"
    elif not categories:
        categories_value = "No categories were returned by the profile source."
        categories_status = "warn" if measured("categories") else "unknown"
    else:
        categories_value = (f"The profile uses {used_categories} of the {slots}-slot audit benchmark."
                            f"{trade_note}{missing_note}")
        categories_status = "good" if used_categories >= slots else "warn"
    rows = [
        ("Claimed", "The profile is verified." if profile.get("is_claimed") is True else
         "The profile is not verified, so public edits are less protected." if profile.get("is_claimed") is False else
         "Verification status was not returned by the profile source.",
         "good" if profile.get("is_claimed") is True else "bad" if profile.get("is_claimed") is False else "unknown"),
        ("Address", f"The public address is {address_value}." if address_value != "none listed" else
         "No public address or service area was found." if address_status == "bad" else
         "Address and service-area details were not returned by the profile source.", address_status),
        ("Phone", f"The public phone number is {profile.get('phone')}." if profile.get("phone") else
         "No phone number is published." if measured("phone") else "Phone data was not returned by the profile source.",
         "good" if profile.get("phone") else "bad" if measured("phone") else "unknown"),
        ("Website", f"The profile links to {profile.get('website')}." if profile.get("website") else
         "No website is linked." if measured("website") else "Website data was not returned by the profile source.",
         "good" if profile.get("website") else "bad" if measured("website") else "unknown"),
        hours_row,
        photos_row(photos, measured("photos")),
        reviews_row(profile, measured("reviews", "rating", "review_items"), neighbour_reviews),
        ("Description", description_value, description_status),
        ("Categories", categories_value, categories_status),
        services_row(services, measured("service_items")),
        booking_row(profile, measured("booking_links", "bookingLinks")),
        attributes_row(profile, measured("attributes")),
        name_verdict_row(profile, measured=measured("name")),
        ("Updates", f"The profile has {update_count} recent public business updates in the stored evidence." if updates else
         "No recent public business update was found." if measured("owner_updates", "owner_update_count") else
         "Recent business updates were not returned by the profile source.",
         "good" if updates else "warn" if measured("owner_updates", "owner_update_count") else "unknown"),
    ]
    return {
        # The renderer needs the complete cached profile, not only the nine
        # score rows. Keeping it here makes the report shell deterministic:
        # sparse evidence is shown as sparse evidence inside the same profile,
        # never by swapping in a smaller component.
        "profile": profile,
        "panel": {
            "name": profile.get("name") or fallback_name,
            "subtitle": " · ".join(x for x in (profile.get("category"), profile.get("city")) if x),
            "ratingValue": profile.get("rating"),
            "reviewsCount": profile.get("reviews"),
            "description": description or None,
            "mapImage": profile.get("main_image") or None,
            "attribution": profile.get("name") or fallback_name,
            "photoLabel": f"{photos} public photos" if photos is not None else None,
        },
        "auditRows": [{"label": label, "value": value, "status": status}
                      for label, value, status in rows],
        "auditNote": "Every row describes public profile evidence; account-only settings remain marked for confirmation.",
        "clientName": profile.get("name") or fallback_name,
        "clientGhost": "",
        "note": "",
    }


def map_image(lat: float, lng: float, half_lat: float, half_lng: float) -> str | None:
    """Return a Google basemap when configured, otherwise stitch OSM tiles.

    The ranking grid is twenty-five coloured badges. On plain paper they are an
    abstraction; over the streets the reader knows, they are their own town with
    the gaps marked. Same data, and only one of the two gets looked at.

    Google Static Maps stays as an image URL so Google's attribution and usage
    accounting remain intact. The OpenStreetMap fallback keeps generation
    working when that optional API is unavailable.
    """
    import math

    zoom = 12
    for z in range(15, 9, -1):
        span = (half_lng * 2) / 360 * (2 ** z)
        if span <= 3.2:                                      # keep it to ~4 tiles wide
            zoom = z
            break

    google_key = os.environ.get("GOOGLE_MAPS_API_KEY") or os.environ.get("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
    if google_key:
        from urllib.parse import urlencode
        return "https://maps.googleapis.com/maps/api/staticmap?" + urlencode({
            "center": f"{lat:.7f},{lng:.7f}",
            "zoom": zoom,
            "size": "640x640",
            "scale": 2,
            "maptype": "roadmap",
            "key": google_key,
        })

    try:
        from PIL import Image
    except ImportError:
        return None

    def to_tile(la: float, lo: float) -> tuple[float, float]:
        n = 2 ** zoom
        x = (lo + 180.0) / 360.0 * n
        r = math.radians(la)
        y = (1.0 - math.asinh(math.tan(r)) / math.pi) / 2.0 * n
        return x, y

    x0, y1 = to_tile(lat + half_lat, lng - half_lng)
    x1, y0 = to_tile(lat - half_lat, lng + half_lng)
    xs, xe = int(math.floor(x0)), int(math.floor(x1))
    ys, ye = int(math.floor(y1)), int(math.floor(y0))
    if (xe - xs + 1) * (ye - ys + 1) > 20:
        return None

    canvas = Image.new("RGB", ((xe - xs + 1) * 256, (ye - ys + 1) * 256), "#eee")
    for tx in range(xs, xe + 1):
        for ty in range(ys, ye + 1):
            url = f"https://tile.openstreetmap.org/{zoom}/{tx}/{ty}.png"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "lead-magnet-audit/1.0"})
                with urllib.request.urlopen(req, timeout=20) as r:
                    tile = Image.open(io.BytesIO(r.read())).convert("RGB")
            except Exception:                                # noqa: BLE001
                continue
            canvas.paste(tile, ((tx - xs) * 256, (ty - ys) * 256))

    # Crop to the grid's own extent so the badges sit over the right streets.
    left = int((x0 - xs) * 256)
    top = int((y1 - ys) * 256)
    right = int((x1 - xs) * 256)
    bottom = int((y0 - ys) * 256)
    if right - left < 80 or bottom - top < 80:
        return None
    canvas = canvas.crop((left, top, right, bottom))

    # Always embedded: the report is one file that a client opens from a link, so a
    # map written next to it would arrive as a broken image.
    encoded = io.BytesIO()
    canvas.convert("RGB").save(encoded, "JPEG", quality=78, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(encoded.getvalue()).decode()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("domain")
    ap.add_argument("--location", default="Germany")
    ap.add_argument("--language", default="German")
    ap.add_argument("--keyword-cache",
                    help="completed JSON from lead_magnet_keywords.py; supplies the measured "
                         "money/map searches and the three client-facing themes")
    ap.add_argument("--embed-map", action="store_true",
                    help="store the grid map as a data URL for a remote renderer")
    ap.add_argument("--grid", help="keyword for the 25-point map ranking grid "
                                   "(needs --coordinate; about $0.05 a run)")
    ap.add_argument("--radius", type=float, default=5.0,
                    help="km from the centre to the outer grid points (Local Falcon's 'grid "
                         "radius'). 5 km covers a town for a trade; 2.5 km fits a cafe or shop; "
                         "10 km for a service-area business. Measured 05.09.2026: 15 km put 16 "
                         "of 25 points in other towns and read as invisibility")
    ap.add_argument("--zoom", type=int, default=12,
                    help="Google Maps zoom for each grid point. Measured 05.09.2026 on a Coventry "
                         "locksmith: 17z returns 4 results, 14z drops a business 4 km away, "
                         "12-13z return the full 20 with the real proximity order")
    ap.add_argument("--business", help="their name as Google shows it, for finding them in the grid")
    ap.add_argument("--coordinate", help="lat,lng for the maps search")
    ap.add_argument("--profile-json", help="compact GBP evidence already fetched by gbp_profile.py")
    a = ap.parse_args()

    keyword_cache = None
    money = None
    if a.keyword_cache:
        keyword_cache = json.loads(Path(a.keyword_cache).read_text())
        if keyword_cache.get("stage") != "complete":
            sys.exit("keyword cache is incomplete; run lead_magnet_keywords.py again")
        money = keyword_cache.get("moneyKeyword")
        # The same rule as at selection time, also for caches written before it
        # (24 September 2026): a rebuild skipped the keyword stage and pulled a
        # town-bearing term out of the old cache.
        if money and a.coordinate:
            # Imported late: lead_magnet_keywords imports this module.
            from lead_magnet_keywords import place_free_term
            searches = keyword_cache.get("searches") or []
            row = next((r for r in searches if r.get("keyword") == money), {"keyword": money})
            money = place_free_term(row, searches, str(keyword_cache.get("profileCity") or ""))["keyword"]
        if keyword_cache.get("market") == "local" and keyword_cache.get("mapKeyword"):
            a.grid = a.grid or keyword_cache["mapKeyword"]

    spend = 0.0
    out: dict = {"domain": a.domain, "missing": []}
    out["leadMagnetFastPath"] = True
    if keyword_cache:
        out["keywordResearch"] = {
            "market": keyword_cache.get("market"),
            "themes": keyword_cache.get("themes") or [],
            "selectedSeeds": (keyword_cache.get("selectedSeeds")
                              or keyword_cache.get("confirmedSeeds") or []),
            "moneyKeyword": keyword_cache.get("moneyKeyword"),
            "mapKeyword": keyword_cache.get("mapKeyword"),
            "selectionNote": keyword_cache.get("selectionNote"),
            "errors": keyword_cache.get("errors") or [],
        }
        out["missing"].extend(keyword_cache.get("errors") or [])

    # 4b. The Business Profile and the map ranking grid.
    #
    # The two exhibits a local business owner cares about most, and nothing was
    # producing them: the components had been built and no pull ever filled
    # them, so the section simply never appeared. On a remote business that is
    # correct. On a plumber it removes the point of the audit.
    #
    # The grid is the same idea as LocalFalcon: run the same search from
    # twenty-five points across their area and record where they come. It is one
    # map request per point, so about five cents for the picture that makes the
    # whole thing land.
    profile_summary = None
    if a.profile_json:
        try:
            profile_summary = json.loads(Path(a.profile_json).read_text())
        except (OSError, json.JSONDecodeError) as error:
            LABS_PROBLEMS.append(f"profile summary unreadable: {str(error)[:160]}")
    if a.grid and (a.coordinate or a.business):
        # The centre is THEIR address, looked up from their own listing.
        #
        # Typed by hand it was wrong on the first real run: the grid was centred
        # on Gilching for a practice registered in Gauting, so twenty-five
        # searches measured the wrong town and the map underneath showed streets
        # the reader does not recognise. A coordinate is exactly the kind of
        # thing nobody proofreads.
        lat0 = lng0 = None
        # gbp_profile.py already resolved the listing and returns its coordinates.
        # Prefer that evidence instead of paying for and waiting on another lookup.
        if a.coordinate:
            lat0, lng0 = (float(x) for x in a.coordinate.split(","))
        elif a.business:
            res = post("serp/google/maps/live/advanced", [{
                "keyword": a.business, "language_name": a.language,
                "location_name": a.location, "depth": 10,
            }])
            spend += res.get("cost", 0)
            for it in ((res["tasks"][0].get("result") or [{}])[0].get("items") or []):
                if a.business.lower() in (it.get("title") or "").lower():
                    lat0, lng0 = it.get("latitude"), it.get("longitude")
                    out.setdefault("gbpLookup", {})["address"] = it.get("address")
                    break
        if lat0 is None:
            out["missing"].append(f"could not find \"{a.business}\" on the map, so no ranking grid")
            a.grid = None

    if a.grid and lat0 is not None:
        # Five by five, --radius km from the centre to the outer points, the way
        # Local Falcon defines a grid radius. A degree of latitude is about
        # 111 km everywhere; longitude shrinks with the cosine of latitude.
        import math
        # The zoom decides what a point can see at all. Measured 05.09.2026
        # (VB Locksmith Services, Coventry, "locksmith"): at 14z the business
        # vanished 4 km from its door, at 12z it was rank 8 there, rank 14 at
        # 8 km and gone at 12 km, where Nuneaton's own locksmiths take over.
        # That decay is the heat map; the old 15 km / 14z grid drew the viewport.
        step_lat = a.radius / 111.0 / 2
        step_lng = step_lat / max(math.cos(math.radians(lat0)), 0.2)
        points = []
        for row_i in range(5):
            for col in range(5):
                lat = lat0 + (2 - row_i) * step_lat
                lng = lng0 + (col - 2) * step_lng
                points.append({
                    "keyword": a.grid, "language_name": a.language,
                    "location_coordinate": f"{lat:.5f},{lng:.5f},{a.zoom}z", "depth": 20,
                    "search_places": False, "search_this_area": True,
                })

        # DataForSEO's Live SERP contract allows one task per request. Run the
        # independent points concurrently (bounded below its account limit),
        # then restore their original order for the map. Cost and evidence are
        # identical to a serial run; only idle network time is removed.
        with ThreadPoolExecutor(max_workers=min(10, len(points))) as pool:
            responses = list(pool.map(fetch_grid_point, points))
        grid_tasks, grid_spend, grid_failures = validated_grid_tasks(responses, points)
        spend += grid_spend
        grid_response = {"tasks": grid_tasks}
        ranks, _ = parse_grid_tasks(
            grid_response, a.business, a.domain, expected=25,
            client_place_id=(profile_summary or {}).get("place_id"),
        )
        summary = grid_summary(
            grid_response, a.business, a.domain,
            client_place_id=(profile_summary or {}).get("place_id"), expected=25,
            profile_reviews=(profile_summary or {}).get("reviews"),
            profile_rating=(profile_summary or {}).get("rating"),
            centre_lat=lat0, centre_lng=lng0,
        )
        if ranks != [point["rank"] for point in summary["points"]]:
            raise RuntimeError("map ranks and listing summary disagree")
        out["geoGrid"] = {
            "keyword": a.grid,
            "businessName": a.business or a.domain,
            "ranks": ranks,
            "checkedPoints": len(points) - len(grid_failures),
            "requestedPoints": len(points),
            "centre": [lat0, lng0],
            "radiusKm": a.radius,
            "zoom": a.zoom,
            "searchMode": {"searchPlaces": False, "searchThisArea": True},
            "points": summary["points"],
            "winners": summary["winners"],
            "competitors": summary.get("competitors"),
            "rivals": summary.get("rivals"),
            "rivalsNamed": summary.get("rivalsNamed"),
            "client": summary["client"],
            "note": (
                f"Twenty-five searches for \"{a.grid}\" from twenty-five points within "
                f"{a.radius:g} km of your location."
                + (f" Across all of them {summary['rivals']} other "
                   f"{'business' if summary['rivals'] == 1 else 'businesses'} ever reached the "
                   f"top three, so this is how deep the field is."
                   if summary.get("rivals") is not None else "")
            ),
        }
        # The real map behind the badges. Without it the grid is coloured
        # squares floating on paper, and the whole point of this exhibit is that
        # the reader recognises their own town in it.
        if a.embed_map:
            img = map_image(lat0, lng0, step_lat * 2.6, step_lng * 2.6)
            if img:
                out["geoGrid"]["mapImage"] = img
                if "maps.googleapis.com/maps/api/staticmap" in img:
                    out["geoGrid"].pop("attribution", None)
                else:
                    out["geoGrid"]["attribution"] = "Map data © OpenStreetMap contributors"

    # 4c. Their Business Profile, field by field.
    #
    # The spec named this source and nobody built it: the panel on the page
    # was hand-seeded, so the exhibit would have come out empty for the first
    # real local client. Same failure as the ranking grid, one layer down.
    #
    # There is no posts endpoint - my_business_updates 404s - so the audit says
    # posts could not be checked rather than guessing at them.
    #
    # The review counts of the map winners, as a silent yardstick. They do not
    # appear in the report; they only decide green or red.
    neighbour_reviews = [
        int(w["reviews"]) for w in ((out.get("geoGrid") or {}).get("winners") or [])
        if isinstance(w.get("reviews"), (int, float)) and w["reviews"]
    ]
    if profile_summary:
        out["gbp"] = gbp_from_summary(profile_summary, a.business or a.domain,
                                      neighbour_reviews)
    elif a.business:
        res = post("business_data/google/my_business_info/live", [{
            "keyword": a.business, "location_name": a.location, "language_name": a.language,
        }])
        spend += res.get("cost", 0)
        items = ((res.get("tasks", [{}])[0].get("result") or [{}])[0].get("items") or [])
        b = items[0] if items else None
        if b:
            rating = (b.get("rating") or {})
            photos = b.get("total_photos")
            hours = b.get("work_time", {}).get("work_hours")
            # One grader, two sources. These rows used to be built here with
            # their own thresholds, and the two paths disagreed with each other
            # inside the same report object: the same profile scored differently
            # depending on which source answered first. The lookup is reshaped
            # into the summary the grader already reads.
            address = b.get("address") or ""
            out["gbp"] = gbp_from_summary({
                "name": b.get("title") or a.business,
                "category": b.get("category"),
                "categories": ([b.get("category")] if b.get("category") else [])
                              + list(b.get("additional_categories") or []),
                "city": (address.split(",")[-2].strip() if address.count(",") >= 2 else ""),
                "address": address,
                "phone": b.get("phone"),
                "website": b.get("url"),
                "opening_hours": hours or [],
                "photos": photos,
                "reviews": rating.get("votes_count") or 0,
                "rating": rating.get("value"),
                "description": b.get("description") or "",
                "is_claimed": b.get("is_claimed"),
                "attributes": b.get("attributes") or {},
                "booking_links": b.get("book_online_link") or [],
                "service_items": [],
                "owner_updates": [],
                "rich_evidence": False,
            }, a.business or a.domain)
            out["gbp"]["auditNote"] = (
                "Every row describes public profile evidence. Posts and account-only "
                "settings are marked for confirmation rather than graded."
            )

    # "no search data came back for x.de" printed twice, because two blocks each
    # noticed the same absence. Order is kept; only repeats go.
    # TWO LISTINGS ARE A FINDING, NOT A FOOTNOTE. `listingMismatch` had been
    # measured for weeks and shown nowhere: one profile counted 271 reviews
    # against 61 in the Maps answer, another 1 against 6. The difference is
    # measurable, but on its own it proves neither a second listing nor split
    # reviews. It is only stated when both sources were measured.
    map_client = (out.get("geoGrid") or {}).get("client") or {}
    if out.get("gbp") and map_client.get("listingMismatch"):
        out["gbp"].setdefault("auditRows", []).append({
            "label": "Google listings",
            "value": (
                f"Your Google profile shows {map_client.get('reviews')} reviews, "
                f"but the listing returned by our Google Maps check shows "
                f"{map_client.get('mapReviews')}. Verify the public listing "
                "before relying on either count."
            ),
            "status": "bad",
        })
    out["missing"] = list(dict.fromkeys(out["missing"]))
    out["spend"] = round(spend, 4)
    json.dump(out, sys.stdout, indent=2, ensure_ascii=False)
    print()
    print(f"spent ${spend:.4f} on this run", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
