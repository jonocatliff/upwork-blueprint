#!/usr/bin/env python3
"""Every Upwork number that can go stale, with where it came from and when.

    python3 code/facts.py get profile.overview.search_preview_chars
    python3 code/facts.py topic profile
    python3 code/facts.py search "skills"
    python3 code/facts.py stale --days 120

The reference files hold the reasoning; this holds the values they quote, so a
number lives in one place and a command can say where it got it. `stale` is the
one that matters over time: a fact nobody re-read in months is a fact that may
already be wrong, and the file says so itself rather than waiting to be caught.
"""
from __future__ import annotations

import argparse
import datetime
import json
import pathlib
import sys

FACTS = pathlib.Path(__file__).resolve().parents[1] / 'references' / 'upwork-facts.json'

# How much weight a number carries, worst last. A command that states a fact says
# which of these it rests on, so a reader can tell documentation from folklore.
STRENGTH = ('upwork_docs', 'upwork_connector', 'measured_scrape', 'study',
            'practitioner', 'unverified')


def load(path: pathlib.Path = FACTS) -> list[dict]:
    payload = json.loads(path.read_text(encoding='utf-8'))
    facts = payload['facts'] if isinstance(payload, dict) else payload
    return [f for f in facts if isinstance(f, dict) and f.get('id')]


def line(fact: dict) -> str:
    """One fact as a sentence a member can read, with its evidence attached."""
    value = fact.get('value')
    unit = str(fact.get('unit') or '')
    shown = f'{value} {unit}'.strip() if unit and unit != 'text' else str(value)
    share = fact.get('share_percent')
    if share is not None:
        shown = f'{shown} ({share}%)'
    return (f'{fact["id"]}: {shown}\n'
            f'    {fact.get("source_kind", "unverified")} · {fact.get("source", "no source")}'
            f' · read {fact.get("measured_at", "undated")}')


def age_days(fact: dict, today: datetime.date) -> int | None:
    try:
        return (today - datetime.date.fromisoformat(str(fact.get('measured_at'))[:10])).days
    except (TypeError, ValueError):
        return None


def cmd_get(args) -> int:
    match = next((f for f in load() if f['id'] == args.fact_id), None)
    if not match:
        print(f'No fact with id {args.fact_id!r}. List them with: '
              f'python3 code/facts.py topic <topic>', file=sys.stderr)
        return 1
    print(line(match))
    return 0


def cmd_topic(args) -> int:
    facts = [f for f in load() if f.get('topic') == args.topic]
    if not facts:
        topics = sorted({f.get('topic', '') for f in load()})
        print(f'No topic {args.topic!r}. Known: {", ".join(t for t in topics if t)}', file=sys.stderr)
        return 1
    facts.sort(key=lambda f: (STRENGTH.index(f.get('source_kind', 'unverified'))
                              if f.get('source_kind') in STRENGTH else len(STRENGTH), f['id']))
    for fact in facts:
        print(line(fact))
    return 0


def cmd_search(args) -> int:
    needle = args.text.lower()
    hits = [f for f in load()
            if needle in f['id'].lower() or needle in str(f.get('value', '')).lower()
            or needle in str(f.get('source', '')).lower()]
    for fact in hits:
        print(line(fact))
    print(f'\n{len(hits)} fact(s).')
    return 0


def cmd_stale(args) -> int:
    today = datetime.date.today()
    rows = []
    for fact in load():
        age = age_days(fact, today)
        if age is None or age >= args.days:
            rows.append((age if age is not None else 10**6, fact))
    rows.sort(reverse=True)
    for age, fact in rows:
        when = 'undated' if age == 10**6 else f'{age} days old'
        print(f'{when:>14}  {fact["id"]}  ({fact.get("source_kind")})')
    print(f'\n{len(rows)} of {len(load())} fact(s) older than {args.days} days. '
          f'Re-read the ones a member would state to a client.')
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('get', help='One fact by id.')
    p.add_argument('fact_id')
    p.set_defaults(func=cmd_get)
    p = sub.add_parser('topic', help='Every fact on one topic, strongest evidence first.')
    p.add_argument('topic')
    p.set_defaults(func=cmd_topic)
    p = sub.add_parser('search', help='Facts whose id, value or source contains this text.')
    p.add_argument('text')
    p.set_defaults(func=cmd_search)
    p = sub.add_parser('stale', help='Facts nobody has re-read lately.')
    p.add_argument('--days', type=int, default=120)
    p.set_defaults(func=cmd_stale)
    args = ap.parse_args(argv)
    return args.func(args)


if __name__ == '__main__':
    raise SystemExit(main())
