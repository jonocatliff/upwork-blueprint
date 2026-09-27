#!/usr/bin/env python3
"""Validate one SEO audit before it is published for an Upwork lead."""

import pathlib
import re
import sys

import pitch_check


# A report is read once, by a stranger, next to the site it describes. These are the ways a
# run leaves something in it that makes the reader stop trusting the rest of the page.
PLACEHOLDERS = ('lorem ipsum', 'TBD', 'TODO', '[client]', '[business]', '{{', 'not recorded yet',
                'XX%', 'N/A%')
# "Nothing found" is a finding. "Could not be measured" is an outage. A page that says the
# first when the grid returned the second is the one mistake a client can catch by looking.
UNMEASURED = re.compile(r'\b(0 of 25|no visibility at all|ranks nowhere)\b', re.I)
# The tools we paid to measure with are our business, not the client's. A report that
# names them reads like a tool's output instead of a person's finding, and it hands the
# client the shopping list for doing this without us. "sitemap" is deliberately absent:
# it is a real thing an owner can ask their developer for.
VENDORS = ('dataforseo', 'apify', 'firecrawl', 'pagespeed', 'portent', 'semrush', 'ahrefs',
           'moz.com', 'screaming frog', 'crawler', 'impression')


def check_page(path, business='', website=''):
    """`website` is the domain saved for this job, and it is the check that matters
    in production: a report left in a job folder from an earlier client passes every
    other gate here, because it is a perfectly good report. It is simply the wrong
    one, and the client it is sent to reads somebody else's numbers. The business
    name is the same check when a human runs it by hand and has the name to type."""
    source = pathlib.Path(path)
    page = source.read_text(encoding='utf-8')
    problems = list(pitch_check.check_page(source, require_hero=False))
    text = pitch_check.visible_text(page)
    for marker in PLACEHOLDERS:
        if marker.lower() in text.lower():
            problems.append(f'still carries the placeholder "{marker}"')
    if business and business.lower() not in text.lower():
        problems.append(f'never names the business it was written for ("{business}")')
    host = str(website or '').strip().lower()
    host = host.split('//')[-1].split('/')[0].removeprefix('www.')
    if host and host not in page.lower():
        problems.append(f'was not written for this job: it never mentions {host}, '
                        'the website saved for it')
    if UNMEASURED.search(text) and 'could not be measured' not in text.lower():
        problems.append('claims zero visibility without saying which points could not be measured')
    for vendor in VENDORS:
        if vendor in text.lower():
            problems.append(f'names the tooling to the client ("{vendor}")')
    if page.count('data-audit-section="') != 3:
        problems.append('does not contain the three checked audit sections')
    if 'name="lead-magnet-template" content="upwork-lead-magnet-v1"' not in page:
        problems.append('is not the current Upwork lead-magnet template')
    if 'Reply here on Upwork' not in page:
        problems.append('does not return the client to Upwork')
    if "connect-src 'none'" not in page:
        problems.append('does not block outbound browser connections')
    if re.search(r'(?:src|href|action)=["\']https?://', page, re.I):
        problems.append('loads or links an external HTTP resource')
    return problems


def main(argv):
    if not 1 <= len(argv) <= 3:
        print('usage: python3 code/lead_magnet_check.py jobs/<id>/lead-magnet.html '
              '["<business name>"] ["<website>"]', file=sys.stderr)
        return 2
    problems = check_page(argv[0], argv[1] if len(argv) >= 2 else '',
                          argv[2] if len(argv) == 3 else '')
    for problem in problems:
        print(f'FAIL  {problem}')
    print('\nPASS  checked audit is safe to publish' if not problems else f'\n{len(problems)} problem(s).')
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
