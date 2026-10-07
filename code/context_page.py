#!/usr/bin/env python3
"""The one clean page that shows a member what is now in their own file.

    python3 code/context_page.py [--open]

/context ends by reporting what it wrote. A report in a terminal scrolls away,
and the file it wrote is markdown with starter lines still in it. This renders
the short version as one full page: who you are, what you sell, your terms, what
you can prove, and what is still open, in that order and nothing more.

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
PLUME = ROOT / 'templates' / 'pitch' / 'ink-plume.png'
STARTER = 'not answered yet'
EMPTY = 'nothing recorded yet'
SHOWN = 6        # entries listed per group, the rest become "and N more"
CLIP = 220       # characters of a long answer before it is cut at a word

# The look of the Automatable landing page, as the pitch pages already use it:
# warm cream, dark ink, one terracotta accent, a serif for the words that matter.
CSS = """
  :root { color-scheme: light; --bg: #f3efe6; --card: #fbf9f4; --ink: #1c1712;
          --text: #262019; --text-2: #5c5347; --text-3: #6f6656; --accent: #c1663e; --accent-on-ink: #e08a5c;
          --on-ink: #f3efe6; --on-ink-2: #b8ad9c; --line: #e2d9c8;
          --sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
          --serif: "Tiempos Text", Georgia, "Iowan Old Style", "Times New Roman", ui-serif, serif;
          --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.55 var(--sans);
         -webkit-font-smoothing: antialiased; min-height: 100vh; display: flex; flex-direction: column; }
  .wrap { width: 100%; max-width: 1240px; margin: 0 auto; padding: 0 32px; }
  header { position: relative; overflow: hidden; padding: 56px 0 44px; }
  header .wrap { position: relative; z-index: 1; }
  .plume { position: absolute; right: -40px; top: -20px; height: 130%; opacity: .55; mix-blend-mode: multiply;
           pointer-events: none; }
  .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--accent);
             margin: 0 0 14px; font-weight: 600; }
  h1 { font: 500 clamp(40px, 6vw, 72px)/1.04 var(--serif); letter-spacing: -.02em; color: var(--ink);
       margin: 0 0 14px; max-width: 14em; }
  .lede { font-size: 19px; color: var(--text-2); margin: 0; max-width: 40em; }
  main { flex: 1; padding: 8px 0 48px; }
  .grid { display: grid; gap: 20px; grid-template-columns: repeat(12, 1fr); }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 26px 28px; }
  .sells { grid-column: span 5; } .terms { grid-column: span 3; } .proof { grid-column: span 4; }
  h2 { font-family: var(--mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--text-3);
       margin: 0 0 14px; font-weight: 600; }
  .sells p { font: 400 21px/1.45 var(--serif); color: var(--ink); margin: 0; }
  .terms dl { margin: 0; display: grid; gap: 14px; }
  .terms dt { font-size: 12.5px; color: var(--text-3); }
  .terms dd { margin: 2px 0 0; font: 400 20px/1.25 var(--serif); color: var(--ink); }
  .stat { font: 400 54px/1 var(--serif); color: var(--ink); margin: 0 0 4px; }
  .stat span { font-size: 17px; color: var(--text-2); font-family: var(--sans); margin-left: 6px; }
  .muted { color: var(--text-3); font-size: 14px; margin: 0; }
  ul { margin: 14px 0 0; padding-left: 18px; color: var(--ink); }
  li { margin-bottom: 4px; }
  footer { background: var(--ink); color: var(--on-ink); padding: 40px 0; }
  footer .wrap { display: grid; grid-template-columns: 2fr 1fr; gap: 40px; align-items: start; }
  footer h2 { color: var(--on-ink-2); }
  footer ul { margin: 0; columns: 2; column-gap: 32px; color: var(--on-ink); list-style: none; padding: 0; }
  footer li { margin-bottom: 6px; break-inside: avoid; }
  footer li::before { content: "\\2022"; color: var(--accent-on-ink); margin-right: 10px; }
  footer .muted { color: var(--on-ink-2); }
  .next p { font: 400 22px/1.35 var(--serif); margin: 0; color: var(--on-ink); }
  .next p.muted { font: 14px/1.5 var(--sans); margin-top: 10px; }
  .next strong { color: var(--accent-on-ink); font-weight: 400; }
  @media (max-width: 900px) {
    .sells, .terms, .proof { grid-column: span 12; } footer .wrap { grid-template-columns: 1fr; }
    .plume { display: none; } header { padding: 40px 0 28px; } .wrap { padding: 0 20px; } footer ul { columns: 1; } }
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
    """Every `**Label:** value` in the file as {label: value, or None when unanswered}."""
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


def listing(items):
    shown = ''.join(f'<li>{esc(i)}</li>' for i in items[:SHOWN])
    extra = len(items) - SHOWN
    tail = f'<li class="muted">and {extra} more</li>' if extra > 0 else ''
    return f'<ul>{shown}{tail}</ul>'


def build(me_text, proof_text):
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

    plume = '<img class="plume" src="../templates/pitch/ink-plume.png" alt="">' if PLUME.is_file() else ''
    headline = esc(one) if one else 'Your Upwork context'
    lede = esc(clip(who)) if who else 'What every command reads before it writes for you.'
    sells_html = f'<p>{esc(clip(sells, 300))}</p>' if sells else '<p class="muted">Still open.</p>'
    rows = ''.join(f'<div><dt>{esc(label)}</dt><dd>{esc(clip(value, 70))}</dd></div>' for label, value in terms if value)
    terms_html = f'<dl>{rows}</dl>' if rows else '<p class="muted">Still open.</p>'

    proof_html = f'<p class="stat">{len(verified)}<span>verified</span></p>'
    proof_html += listing(verified) if verified else '<p class="muted">Nothing verified yet. The first delivered job fills this.</p>'
    if pending:
        proof_html += (f'<p class="muted" style="margin-top:14px">{len(pending)} pending, never shown to a client '
                       f'until you can say where it can be checked.</p>')
    gaps_html = listing(gaps) if gaps else '<p class="muted">Nothing is open.</p>'

    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>Your Upwork context</title>\n<style>' + CSS + '</style>\n</head>\n<body>\n'
            f'<header>{plume}<div class="wrap"><p class="eyebrow">Your Upwork context</p>'
            f'<h1>{headline}</h1><p class="lede">{lede}</p></div></header>\n'
            '<main><div class="wrap"><div class="grid">\n'
            f'  <section class="card sells"><h2>What you sell</h2>{sells_html}</section>\n'
            f'  <section class="card terms"><h2>Your terms</h2>{terms_html}</section>\n'
            f'  <section class="card proof"><h2>What you can prove</h2>{proof_html}</section>\n'
            '</div></div></main>\n'
            '<footer><div class="wrap">\n'
            f'  <div><h2>Still open</h2>{gaps_html}</div>\n'
            '  <div class="next"><h2>Next</h2><p><strong>/profile</strong> measures your live profile and writes the one '
            'that fixes it.</p><p class="muted">None of what is open blocks it. Built from context/me.md on this machine.</p></div>\n'
            '</div></footer>\n</body>\n</html>\n')


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
    OUT.write_text(build(me_text, proof_text), encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)} written, {open_points} open')
    if args.open:
        webbrowser.open(OUT.as_uri())
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
