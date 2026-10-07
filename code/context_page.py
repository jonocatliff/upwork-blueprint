#!/usr/bin/env python3
"""The member's one-page CV, built from their own file.

    python3 code/context_page.py [--open]

/context ends by reporting what it wrote. A report in a terminal scrolls away,
and the file it wrote is markdown with starter lines still in it. This renders
it as one page laid out like a CV, with the same sections as `context/me.md`:
background, what you do, results on the left, how you work, credentials, reviews
and what is still open on the right.

Output is `context/overview.html`, which is gitignored like everything else in
that folder. It is built from the files alone and reaches no service. It prints
on one A4 page.
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
EMPTY = ('nothing recorded yet', 'not filled in yet', STARTER)
CLIP = 260       # characters of a long answer before it is cut at a word
JOBS = 4         # background entries shown, the rest become "and N more"

# The Automatable look: ivory page, ink text, one clay accent, a serif for
# headings and a small mono for labels.
CSS = """
  :root { color-scheme: light; --ivory: #faf9f5; --ink: #141413; --clay: #c96442; --clay-deep: #a94f31;
          --clay-soft: #f6e4dc; --sand: #e8e6dc; --stone: #d1cfc5; --muted: #5e5d59; --soft: #87867f;
          --green: #2f5d2c; --green-soft: #e3efe2;
          --display: "Tiempos Text", Georgia, "Iowan Old Style", "Times New Roman", ui-serif, serif;
          --sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
          --mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--ivory); color: var(--muted); font: 15.5px/1.55 var(--sans);
         -webkit-font-smoothing: antialiased; }
  .page { max-width: 1040px; margin: 0 auto; padding: 48px 32px 56px; }
  .eyebrow, h2, dt { font-family: var(--mono); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
                     color: var(--soft); font-weight: 400; }
  .eyebrow { color: var(--clay-deep); margin: 0 0 14px; }
  h1 { font: 500 clamp(30px, 4.6vw, 46px)/1.08 var(--display); letter-spacing: -1px; color: var(--ink);
       margin: 0 0 10px; max-width: 20em; }
  .lede { font-size: 17px; margin: 0; max-width: 40em; }
  .cols { display: grid; grid-template-columns: 1.7fr 1fr; gap: 0 48px; margin-top: 30px;
          border-top: 1px solid var(--stone); }
  section { padding: 22px 0 6px; }
  section + section { border-top: 1px solid var(--sand); }
  h2 { margin: 0 0 12px; }
  .entry { margin: 0 0 14px; }
  .entry b, .entry strong { display: block; font: 500 17px/1.3 var(--display); color: var(--ink); margin-bottom: 2px; }
  .entry p { margin: 0; }
  .entry small { display: block; color: var(--soft); font-size: 13px; margin-top: 2px; }
  .tag { display: inline-block; font: 400 10px/1 var(--mono); text-transform: uppercase; letter-spacing: 1.5px;
         padding: 4px 8px; border-radius: 6px; margin-right: 8px; vertical-align: 2px; }
  .tag.v { background: var(--green-soft); color: var(--green); } .tag.p { background: var(--clay-soft); color: var(--clay-deep); }
  dl { margin: 0; display: grid; gap: 12px; }
  dd { margin: 2px 0 0; font: 400 18px/1.25 var(--display); color: var(--ink); }
  .rows p { margin: 0 0 10px; } .rows b { color: var(--ink); font-weight: 600; }
  .muted { color: var(--soft); font-size: 14px; margin: 0; }
  ul { margin: 0; padding-left: 18px; } li { margin-bottom: 3px; }
  .open { background: var(--clay-soft); border-radius: 12px; padding: 16px 18px; margin-top: 22px; }
  .open h2 { color: var(--clay-deep); }
  .next { margin-top: 26px; padding-top: 18px; border-top: 1px solid var(--stone); font-size: 14px; }
  .next code { font-family: var(--mono); background: var(--sand); padding: 1px 6px; border-radius: 5px; color: var(--ink); }
  @media (max-width: 800px) { .cols { grid-template-columns: 1fr; } .page { padding: 32px 20px 40px; } }
  @media print { @page { size: A4; margin: 10mm; } body { font-size: 10px; line-height: 1.45; background: #fff; }
                 .page { padding: 0; max-width: none; } h1 { font-size: 24px; margin-bottom: 6px; }
                 .lede { font-size: 12px; } .cols { margin-top: 12px; gap: 0 24px; } dd { font-size: 14px; }
                 .entry strong { font-size: 13px; } .entry { margin-bottom: 8px; }
                 section { padding: 8px 0 0; break-inside: avoid; } .open { margin-top: 8px; padding: 10px 12px; }
                 .next { margin-top: 12px; padding-top: 8px; } }
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


def blank(text):
    return not text.strip() or any(mark in text.lower() for mark in EMPTY)


def entries(body):
    """Each `###` block as {title, text, place, status}. Empty starter blocks are dropped."""
    found, title, lines = [], None, []
    for line in body + ['### ']:
        if line.startswith('### '):
            if title:
                text = [x.strip() for x in lines if x.strip() and not x.strip().startswith('- ')]
                bullets = {m.group(1).lower(): m.group(2).strip() for x in lines
                           for m in [re.match(r'^-\s*([^:]+):\s*(.*)$', x.strip())] if m}
                place = next((v for k, v in bullets.items() if k.startswith('where')), '')
                status = bullets.get('status', '').lower()
                joined = ' '.join(text)
                if joined and not blank(joined):
                    found.append({'title': title, 'text': joined, 'place': place,
                                  'verified': 'verified' in status and 'pending' not in status})
            title, lines = line[4:].strip(), []
        elif title is not None:
            lines.append(line)
    return found


def entry_html(item, tag=False):
    badge = ''
    if tag:
        badge = '<span class="tag v">verified</span>' if item['verified'] else '<span class="tag p">pending</span>'
    place = f'<small>Checked at: {esc(item["place"])}</small>' if item['place'] else ''
    return f'<div class="entry"><strong>{badge}{esc(item["title"])}</strong><p>{esc(clip(item["text"]))}</p>{place}</div>'


def block(title, inner):
    return f'<section><h2>{esc(title)}</h2>{inner}</section>'


def build(me_text, proof_text):
    me = dict(sections(me_text))
    found = answers(me)

    who = pick(found, 'Profession')
    one = pick(found, 'The one thing')
    sells = pick(found, 'Services you sell')
    avoid = pick(found, 'What you do NOT')
    industries = pick(found, 'Industries')

    jobs = entries(me.get('Your background', []))
    background = ''.join(entry_html(j) for j in jobs[:JOBS])
    if len(jobs) > JOBS:
        background += f'<p class="muted">and {len(jobs) - JOBS} more</p>'
    if not jobs:
        plain = clip(' '.join(x.strip() for x in me.get('Your background', []) if x.strip() and not blank(x)))
        background = f'<p>{esc(plain)}</p>' if plain else '<p class="muted">Still open.</p>'

    rows = ''.join(f'<p><b>{label}</b> {esc(clip(value))}</p>' for label, value in (
        ('Sells', sells), ('Does not do', avoid), ('Works with', industries)) if value)
    do_html = rows and f'<div class="rows">{rows}</div>' or '<p class="muted">Still open.</p>'

    results = entries(cc.proof_only(me_text) and dict(sections(proof_text)).get('Results', []))
    results_html = ''.join(entry_html(r, tag=True) for r in results) or \
        '<p class="muted">Nothing yet. The first delivered job fills this.</p>'

    terms = [(label, pick(found, key)) for label, key in (
        ('Hourly rate', 'Hourly rate'), ('Smallest project', 'Smallest project'),
        ('Timezone and hours', 'Timezone'), ('Applications a day', 'Applications per day'),
        ('Job Success Score', 'Job Success'), ('Intro video', 'Intro video'))]
    dl = ''.join(f'<div><dt>{esc(label)}</dt><dd>{esc(clip(value, 70))}</dd></div>' for label, value in terms if value)
    terms_html = f'<dl>{dl}</dl>' if dl else '<p class="muted">Still open.</p>'

    proof = dict(sections(proof_text))
    creds = entries(proof.get('Credentials', []))
    creds_html = ''.join(entry_html(c, tag=True) for c in creds) or '<p class="muted">None recorded yet.</p>'
    reviews = entries(proof.get('Reviews', []))
    reviews_html = ''.join(entry_html(r) for r in reviews) or '<p class="muted">None recorded yet.</p>'

    gaps = [short(label) for label, value in found.items() if value is None]
    open_html = ''
    if gaps:
        shown = ''.join(f'<li>{esc(g)}</li>' for g in gaps[:6])
        more = f'<li class="muted">and {len(gaps) - 6} more</li>' if len(gaps) > 6 else ''
        open_html = f'<div class="open"><h2>Still open</h2><ul>{shown}{more}</ul></div>'

    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>Your Upwork context</title>\n<style>' + CSS + '</style>\n</head>\n<body>\n'
            '<div class="page">\n'
            f'<p class="eyebrow">Your Upwork context</p><h1>{esc(one) if one else "Your Upwork context"}</h1>'
            f'<p class="lede">{esc(clip(who)) if who else "What every command reads before it writes for you."}</p>\n'
            '<div class="cols">\n<div>\n'
            + block('Background', background) + block('What you do', do_html) + block('Results', results_html) +
            '\n</div>\n<div>\n'
            + block('How you work', terms_html) + block('Credentials', creds_html) + block('Reviews', reviews_html) +
            open_html +
            '\n</div>\n</div>\n'
            '<p class="next">Next: <code>/profile</code> writes the profile from this page. '
            'None of what is open blocks it. Built from context/me.md on this machine.</p>\n'
            '</div>\n</body>\n</html>\n')


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
