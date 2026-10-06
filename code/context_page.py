#!/usr/bin/env python3
"""The one clean page that shows a member what is now in their own file.

    python3 code/context_page.py [--open]

/context ends by reporting what it wrote. A report in a terminal scrolls away,
and the file it wrote is markdown with starter lines still in it. This renders
the short version on one page: who you are, what you sell, your terms, what you
can prove, and what is still open, in that order and nothing more.

Output is `context/overview.html`, which is gitignored like everything else in
that folder. It is built from the files alone and reaches no service.
"""
import argparse
import html
import pathlib
import re
import sys
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'code'))
import context_check as cc  # noqa: E402

OUT = ROOT / 'context' / 'overview.html'
STARTER = 'not answered yet'
EMPTY = 'nothing recorded yet'
SHOWN = 6        # entries listed per group, the rest become "and N more"
CLIP = 220       # characters of a long answer before it is cut at a word

CSS = """
  :root { color-scheme: light; --bg: #f5f6f8; --card: #fff; --line: #e6e9ee;
          --t1: #101828; --t2: #475467; --t3: #7b8794; --accent: #1f6f6b;
          --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--t2); font: 15px/1.55 var(--sans);
         -webkit-font-smoothing: antialiased; }
  main { max-width: 640px; margin: 0 auto; padding: 36px 20px 56px; }
  h1 { font-size: 26px; line-height: 1.2; color: var(--t1); margin: 0 0 4px; letter-spacing: -.01em; }
  .sub { color: var(--t3); font-size: 13.5px; margin: 0 0 20px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 6px 22px; }
  section { padding: 16px 0; border-top: 1px solid var(--line); }
  section:first-child { border-top: 0; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .07em; color: var(--t3); margin: 0 0 8px; }
  p { margin: 0 0 6px; color: var(--t1); }
  .big { font-size: 17px; font-weight: 600; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 18px; margin: 0; }
  dt { color: var(--t3); font-size: 13.5px; }
  dd { margin: 0; color: var(--t1); }
  ul { margin: 0; padding-left: 18px; color: var(--t1); }
  li { margin-bottom: 3px; }
  .muted { color: var(--t3); font-size: 13.5px; }
  .open { color: #94531b; }
  .next { margin: 18px 2px 0; color: var(--t2); }
  .next strong { color: var(--accent); }
  @media (max-width: 480px) { dl { grid-template-columns: 1fr; gap: 0; } dt { margin-top: 8px; } }
"""


def esc(text):
    return html.escape(str(text), quote=False)


def sections(text):
    """Each `## heading` with the lines under it, in file order."""
    found, name, body = [], None, []
    for line in text.splitlines():
        if line.startswith('## '):
            if name:
                found.append((name, body))
            name, body = line[3:].strip(), []
        elif name is not None:
            body.append(line)
    if name:
        found.append((name, body))
    return found


def answers(me):
    """Every `**Label:** value` in the file as {label: value or None when unanswered}."""
    found = {}
    for _, body in me.items():
        for line in body:
            match = re.match(r'^\*\*(.+?):\*\*\s*(.*)$', line.strip())
            if match:
                value = match.group(2).strip()
                found[match.group(1).strip()] = None if (not value or STARTER in value.lower()) else value
    return found


def pick(found, start):
    """The answer whose label begins with `start`; None when open or absent."""
    for label, value in found.items():
        if label.lower().startswith(start.lower()):
            return value
    return None


def clip(text, limit=CLIP):
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(' ', 1)[0].rstrip(',;:') + '…'


def short(label):
    """A label without its parenthesis: 'How settled ... (decided, leaning, open)' reads as a gap."""
    return re.sub(r'\s*\(.*?\)', '', label).strip()


def proof_blocks(body):
    """(title, verified) for each `###` block. Verified only when no pending is in it."""
    blocks, title, lines = [], None, []
    for line in body + ['### ']:
        if line.startswith('### '):
            if title:
                text = '\n'.join(lines)
                if EMPTY not in text.lower():
                    verified = bool(re.search(r'\bverified\b', text, re.I)) and not re.search(r'\bpending\b', text, re.I)
                    blocks.append((title, verified))
            title, lines = line[4:].strip(), []
        elif title is not None:
            lines.append(line)
    return blocks


def listing(items, more_word='more'):
    shown = ''.join(f'<li>{esc(i)}</li>' for i in items[:SHOWN])
    extra = len(items) - SHOWN
    tail = f'<li class="muted">and {extra} {more_word}</li>' if extra > 0 else ''
    return f'<ul>{shown}{tail}</ul>'


def build(me_text, proof_text, open_points):
    me = dict(sections(me_text))
    proof = dict(sections(proof_text))
    found = answers(me)

    who = pick(found, 'Profession')
    one = pick(found, 'The one thing')
    sells = pick(found, 'Services you sell')
    terms = [(label, pick(found, key)) for label, key in (
        ('Hourly rate', 'Hourly rate'), ('Smallest project', 'Smallest project'),
        ('Timezone', 'Timezone'), ('Applications a day', 'Applications per day'))]

    blocks = []
    for name in ('Results', 'Reviews', 'Credentials'):
        blocks += proof_blocks(proof.get(name, []))
    verified = [t for t, ok in blocks if ok]
    pending = [t for t, ok in blocks if not ok]
    gaps = [short(label) for label, value in found.items() if value is None]

    top = f'<p class="big">{esc(one)}</p>' if one else '<p class="muted">Still open: the one thing you want to be hired for.</p>'
    top += f'<p>{esc(clip(who))}</p>' if who else ''
    sells_html = f'<p>{esc(clip(sells))}</p>' if sells else '<p class="muted">Still open.</p>'
    rows = ''.join(f'<dt>{esc(label)}</dt><dd>{esc(clip(value, 90))}</dd>' for label, value in terms if value)
    terms_html = f'<dl>{rows}</dl>' if rows else '<p class="muted">Still open.</p>'

    proof_html = ''
    if verified:
        proof_html += listing(verified)
    else:
        proof_html += '<p class="muted">Nothing verified yet. The first delivered job fills this.</p>'
    if pending:
        proof_html += (f'<p class="muted" style="margin-top:8px">{len(pending)} pending, never shown to a client '
                       f'until you can say where it can be checked.</p>')

    open_html = ''
    if gaps:
        open_html = ('<section><h2>Still open</h2>' + listing(gaps) +
                     '<p class="muted" style="margin-top:6px">None of it blocks the next command.</p></section>')

    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>Your Upwork context</title>\n<style>' + CSS + '</style>\n</head>\n<body>\n<main>\n'
            '  <h1>Your Upwork context</h1>\n'
            '  <p class="sub">What every command reads before it writes for you. Built from context/me.md on this machine.</p>\n'
            '  <div class="card">\n'
            f'    <section><h2>You</h2>{top}</section>\n'
            f'    <section><h2>What you sell</h2>{sells_html}</section>\n'
            f'    <section><h2>Your terms</h2>{terms_html}</section>\n'
            f'    <section><h2>What you can prove</h2>{proof_html}</section>\n'
            f'    {open_html}\n'
            '  </div>\n'
            '  <p class="next">Next: <strong>/profile</strong> measures your live profile and writes the one that fixes it.</p>\n'
            '</main>\n</body>\n</html>\n')


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--open', action='store_true', help='open it in the browser')
    args = parser.parse_args(argv)
    if not cc.ME.is_file():
        print(f'{cc.ME} is missing. Run python3 code/workspace.py')
        return 1
    me_text = cc.ME.read_text(encoding='utf-8')
    proof_text = cc.proof_only(me_text)
    open_points = len(cc.check_me(me_text) + cc.check_proof(proof_text))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(build(me_text, proof_text, open_points), encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)} written, {open_points} open')
    if args.open:
        webbrowser.open(OUT.as_uri())
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
