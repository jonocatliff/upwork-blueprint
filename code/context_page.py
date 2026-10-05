#!/usr/bin/env python3
"""The one page that shows a member what is now in their own file.

    python3 code/context_page.py [--open]

/context ends by reporting what it wrote. A report in a terminal scrolls away,
and the file it wrote is markdown with starter lines still in it, which
is a poor thing to read back. This renders both into one page: what they sell,
how they work, what they can prove, and what is still open, with anything still
unanswered shown as a gap rather than hidden.

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


def labelled(body):
    """The `**Label:** value` pairs in a section, unanswered ones included."""
    pairs = []
    for line in body:
        match = re.match(r'^\*\*(.+?):\*\*\s*(.*)$', line.strip())
        if match:
            label, value = match.group(1).strip(), match.group(2).strip()
            pairs.append((label, value, STARTER in value.lower() or not value))
    return pairs


def prose(body):
    """The lines of a section that are not label pairs and not blank."""
    out = []
    for line in body:
        line = line.strip()
        if not line or re.match(r'^\*\*(.+?):\*\*', line):
            continue
        out.append(line)
    return out


def proof_items(body):
    """Proof blocks with their status, so metadata stays beside the result."""
    items = []
    for _, line in cc.entries('## Results\n' + '\n'.join(body)):
        if not line or EMPTY in line.lower() or line.startswith('One block per'):
            continue
        status = 'pending'
        if re.search(r'\bverified\b', line, re.I):
            status = 'verified'
        items.append((line, status))
    return items


def esc(text):
    return html.escape(str(text), quote=False)


def field_rows(pairs):
    rows = []
    for label, value, missing in pairs:
        shown = 'still open' if missing else esc(value)
        cls = ' class="gap"' if missing else ''
        rows.append(f'<div class="row"><dt>{esc(label)}</dt>'
                    f'<dd{cls}>{shown}</dd></div>')
    return '\n'.join(rows)


def build(me_text, proof_text, open_points):
    me = dict(sections(me_text))
    proof = dict(sections(proof_text))

    def block(title, key, note=''):
        body = me.get(key, [])
        pairs, lines = labelled(body), prose(body)
        if not pairs and not lines:
            return ''
        inner = field_rows(pairs)
        if lines:
            text = ' '.join(lines)
            if STARTER in text.lower() or 'Not filled in yet' in text or 'Not set yet' in text:
                inner = f'<p class="gap">Still open. {esc(note)}</p>' + inner
            else:
                inner = f'<p class="prose">{esc(text)}</p>' + inner
        return f'<section><h2>{esc(title)}</h2><dl>{inner}</dl></section>'

    results = proof_items(proof.get('Results', []))
    reviews = proof_items(proof.get('Reviews', []))
    creds = proof_items(proof.get('Credentials', []))
    everything = results + reviews + creds
    verified = [t for t, s in everything if s == 'verified']
    pending = [t for t, s in everything if s == 'pending']

    def proof_list(items, kind):
        if not items:
            return f'<p class="gap">Nothing {kind} yet.</p>'
        return '<ul>' + ''.join(f'<li>{esc(t)}</li>' for t in items) + '</ul>'

    parts = [
        block('What you sell', 'What you do'),
        block('How you work', 'How you work'),
        block('Your background', 'Your background',
              'Run /context background to fill it in.'),
        block('How you sound', 'How you sound'),
        block('Your daily target', 'Your daily target'),
        block('Job search tracks', 'Job search tracks',
              '/find-jobs proposes them on its first run.'),
    ]

    verdict = ('Nothing is open. Every command after this one has what it needs.'
               if not open_points else
               f'{open_points} question{"s" if open_points != 1 else ""} still open. '
               f'Nothing here blocks the next command; each gap is a claim that '
               f'stays unmade until you fill it.')

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your Upwork context</title>
<style>
  :root {{
    color-scheme: light;
    --bg: #f2f4f7; --card: #fff; --soft: #f8fafc; --line: #e4e8ee;
    --t1: #101828; --t2: #475467; --t3: #7b8794; --accent: #1f6f6b;
    --accent-lt: #e2f0ef; --good: #15683f; --good-lt: #e3f2ea; --gap: #94531b;
    --gap-lt: #fbeedb; --shadow: 0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.05);
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }}
  * {{ box-sizing: border-box; }}
  body {{ margin: 0; background: var(--bg); color: var(--t2); font-family: var(--sans);
         font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; }}
  .wrap {{ max-width: 780px; margin: 0 auto; padding: 40px 20px 72px; }}
  h1 {{ font-size: 30px; line-height: 1.15; color: var(--t1); margin: 0 0 6px; letter-spacing: -.01em; }}
  h2 {{ font-size: 17px; color: var(--t1); margin: 0 0 12px; letter-spacing: -.005em; }}
  .lede {{ color: var(--t2); margin: 0 0 8px; }}
  .stamp {{ font-size: 13px; color: var(--t3); margin: 0 0 26px; }}
  .verdict {{ background: var(--accent-lt); border-radius: 10px; padding: 15px 18px;
              color: var(--t1); font-size: 14.5px; margin-bottom: 26px; }}
  section {{ background: var(--card); border: 1px solid var(--line); border-radius: 12px;
             padding: 20px 22px; box-shadow: var(--shadow); margin-bottom: 14px; }}
  dl {{ margin: 0; }}
  .row {{ display: grid; grid-template-columns: minmax(0,230px) 1fr; gap: 4px 18px;
          padding: 8px 0; border-top: 1px solid var(--line); }}
  .row:first-child {{ border-top: 0; padding-top: 0; }}
  dt {{ color: var(--t3); font-size: 13.5px; }}
  dd {{ margin: 0; color: var(--t1); font-size: 14.5px; }}
  .gap {{ color: var(--gap); background: var(--gap-lt); border-radius: 4px;
          padding: 1px 7px; display: inline-block; font-size: 13.5px; }}
  p.gap {{ display: block; margin: 0 0 10px; }}
  .prose {{ margin: 0 0 12px; color: var(--t2); font-size: 14.5px; }}
  ul {{ margin: 0; padding-left: 18px; }}
  li {{ margin-bottom: 7px; color: var(--t1); font-size: 14.5px; }}
  .split {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 14px; }}
  .tag {{ display: inline-block; font-size: 11.5px; font-weight: 600; letter-spacing: .06em;
          text-transform: uppercase; padding: 2px 8px; border-radius: 4px; margin-bottom: 10px; }}
  .tag.v {{ background: var(--good-lt); color: var(--good); }}
  .tag.p {{ background: var(--gap-lt); color: var(--gap); }}
  footer {{ margin-top: 30px; font-size: 13px; color: var(--t3); }}
  @media (max-width: 560px) {{ .row {{ grid-template-columns: 1fr; }} }}
</style>
</head>
<body>
<div class="wrap">
  <h1>Your Upwork context</h1>
  <p class="lede">What every command reads before it writes a word for you or a client.</p>
  <p class="stamp">Built from context/me.md. Nothing on this page left your machine.</p>

  <div class="verdict">{esc(verdict)}</div>

  {''.join(p for p in parts if p)}

  <section>
    <h2>What you can prove</h2>
    <div class="split">
      <div>
        <span class="tag v">verified</span>
        {proof_list(verified, 'verified')}
      </div>
      <div>
        <span class="tag p">pending</span>
        {proof_list(pending, 'pending')}
      </div>
    </div>
    <p class="prose" style="margin-top:14px">A pending entry never reaches a client. It becomes
    verified the moment you can say where it can be checked.</p>
  </section>

  <footer>Rebuild this page any time with <code>python3 code/context_page.py</code>.</footer>
</div>
</body>
</html>
"""


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
