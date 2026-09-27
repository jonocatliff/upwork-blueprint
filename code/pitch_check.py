#!/usr/bin/env python3
"""The gate for what goes to a client before a contract: the pitch page.

    python3 code/pitch_check.py page jobs/<id>/pitch.html

The page check exists because Upwork bans contact details before a contract,
and a linked page counts: an email, a phone number, a booking link, a WhatsApp
button or a social profile on it is a way to reach the freelancer off Upwork.
"""
import html
import pathlib
import re
import sys

# Every way found so far to reach a freelancer off Upwork. A denylist is only as
# current as the last person who added to it, so the checks below also look for a
# bare address or number, which no new meeting service can rename.
CONTACT_LINKS = re.compile(
    r'(mailto:|tel:|sms:|wa\.me|whatsapp|'
    r'calendly|cal\.com/|tidycal|zcal\.co|savvycal|meetings\.hubspot|hubspot\.com/meetings|'
    r'youcanbook\.me|acuityscheduling|oncehub|koalendar|book\.ms|'
    r'zoom\.us|meet\.google\.com|calendar\.google\.com|teams\.microsoft\.com|teams\.live\.com|'
    r'webex\.com|whereby\.com|gotomeeting|skype:|join\.skype|'
    r'linkedin\.com|instagram\.com|facebook\.com|fb\.me|tiktok\.com|twitter\.com|//x\.com|t\.me/|'
    r'telegram|discord\.gg|signal\.me)', re.I)
EMAIL = re.compile(r'\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b', re.I)
PHONE = re.compile(r'(?<![\w.])\+?\d[\d ().-]{8,}\d(?![\w.])')
BOOKING_WORDS = re.compile(r'\b(book a call|schedule a call|book a meeting|email me|call me|whatsapp me)\b', re.I)


def visible_text(page):
    """What a reader sees: no scripts, styles, comments or embedded images."""
    page = re.sub(r'<(script|style)\b.*?</\1>', ' ', page, flags=re.S | re.I)
    page = re.sub(r'<!--.*?-->', ' ', page, flags=re.S)
    page = re.sub(r'<[^>]+>', ' ', page)
    return html.unescape(page)


def links(page):
    """Every href, however it was quoted. A single-quoted one used to walk past."""
    pairs = re.findall(r"""href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'""", page)
    found = [double or single for double, single in pairs]
    return [h for h in found if h and not h.startswith(('#', 'data:'))]


def check_page(path, *, require_hero=False):
    page = pathlib.Path(path).read_text(encoding='utf-8')
    problems = []
    for h in links(page):
        if CONTACT_LINKS.search(h):
            problems.append(f'links a way to reach you off Upwork: {h[:80]}')
    text = visible_text(page)
    for m in EMAIL.finditer(text):
        problems.append(f'shows an email address: {m.group(0)}')
    for m in PHONE.finditer(text):
        if len(re.sub(r'\D', '', m.group(0))) >= 9:
            problems.append(f'shows what looks like a phone number: {m.group(0).strip()}')
    for m in BOOKING_WORDS.finditer(text):
        problems.append(f'asks for contact off Upwork: "{m.group(0)}"')
    if chr(0x2014) in text:
        problems.append('uses an em-dash in the copy')
    left = re.findall(r'\{\{[A-Z_]+\}\}', page)
    if left:
        problems.append(f'unfilled placeholders: {", ".join(sorted(set(left)))}')
    hero = re.search(r'<div class="hero-art"[^>]*>\s*<img\s+[^>]*src="data:image/', page, re.I)
    # Only when the caller says a hero was drawn for this page. The gate exists to
    # catch an image that failed to embed, not to refuse a member who has no way
    # to draw one.
    if require_hero and not hero:
        problems.append('a hero image was expected and is missing or not embedded')
    return problems


def main(argv):
    if len(argv) != 2 or argv[0] != 'page':
        print(__doc__, file=sys.stderr)
        return 2
    problems = check_page(argv[1])
    summary = 'no contact details, no placeholders'
    for p in problems:
        print(f'FAIL  {p}')
    print(f'\n{"PASS  " + summary if not problems else f"{len(problems)} problem(s)."}')
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
