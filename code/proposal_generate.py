#!/usr/bin/env python3
"""The one page a client reads after the call, as a page rather than a wall of text.

    python3 code/proposal_generate.py <job id> --file proposal.json
    python3 code/proposal_generate.py <job id> --file -        # JSON on stdin

Writes jobs/<id>/proposal.html from templates/proposal/template.html. The markdown
proposal stays the thing the member pastes into Upwork chat; this is the page they can
link once a contract exists, and the artifact a client actually reads twice.

Every value the call did not settle is rendered as a visible "open" marker, never as a
zero and never as a rounded guess: a missing number is honest, an invented one is a claim
the first milestone exposes.

The JSON, all strings unless noted:

    client, headline, subline, price, price_note, quote, cost_line, stones_note,
    cta, cta_href, fine (array), included (array),
    milestones (array of {label, amount}), weeks (number),
    rows (array of {label, from, to, kind, colour}),
    labels (object, optional, overrides the six section labels)
"""
import argparse
import base64
import datetime
import html
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / 'templates' / 'proposal' / 'template.html'
OPEN = '<span class="missing">open</span>'
BARS = ('b1', 'b2', 'b3')
DEFAULT_LABELS = {
    'state': 'What you said, and what it changed',
    'plan': 'The plan, week by week',
    'stones': 'What you pay, and when',
    'included': 'How this runs',
}


def abort(message):
    print(f'ABORT: {message}', file=sys.stderr)
    raise SystemExit(1)


def esc(value):
    return html.escape(str(value), quote=True)


def value(raw):
    """A filled value, or the open marker when the call did not settle it."""
    text = str(raw or '').strip()
    return esc(text) if text else OPEN


def week_heads(weeks):
    return ''.join(f'<span class="wk">WK {i + 1}</span>' for i in range(weeks)) + '<span></span>'


def gantt_rows(rows, weeks):
    out = []
    for index, row in enumerate(rows):
        kind = str(row.get('kind') or 'one-off')
        colour = row.get('colour') or BARS[index % len(BARS)]
        start, end = int(row.get('from', 1)), int(row.get('to', 1))
        if not 1 <= start <= end <= weeks:
            abort(f'row "{row.get("label")}" spans week {start} to {end}, outside 1 to {weeks}.')
        swatch = 'var(--ink)' if kind == 'milestone' else f'var(--bar-{colour[-1]})'
        cells = [f'<span class="row-label"><i class="swatch" style="background:{swatch}"></i>'
                 f'{value(row.get("label"))}</span>']
        if kind == 'milestone':
            cells += ['<span></span>'] * (start - 1) + ['<span class="dot"></span>']
            cells += ['<span></span>'] * (weeks - start)
        else:
            cells += ['<span></span>'] * (start - 1)
            cells.append(f'<span class="bar {colour}" style="grid-column: {start + 1} / {end + 2}"></span>')
            cells += ['<span></span>'] * (weeks - end)
        # 'one-off' on every row is noise: only a kind that differs earns the column
        cells.append(f'<span class="kind">{esc(kind)}</span>' if kind != 'one-off' else '<span></span>')
        out.append('\n      '.join(cells))
    return '\n      '.join(out)


def call_notes(items):
    """What they said, and what it changed. Their words on the left, never ours."""
    if not items:
        return f'<div class="note-pair"><p class="said">{OPEN}</p></div>'
    out = []
    for item in items:
        out.append('<div class="note-pair">'
                   f'<p class="said">{value(item.get("said"))}</p>'
                   f'<p class="means">{value(item.get("means"))}</p></div>')
    return ''.join(out)


def benefits(items):
    """Every line a label the client remembers plus the sentence that makes it true."""
    if not items:
        return f'<div class="benefit"><i class="tick">+</i><div><b>{OPEN}</b></div></div>'
    out = []
    for item in items:
        if isinstance(item, str):
            label, note = item, ''
        else:
            label, note = item.get('label'), item.get('note')
        body = f'<b>{value(label)}</b>' + (f'<span>{esc(note)}</span>' if note else '')
        out.append(f'<div class="benefit"><i class="tick">+</i><div>{body}</div></div>')
    return ''.join(out)


def sketch(job_id):
    """The illustrated sheet, inlined so the page travels as one file. Absent is fine."""
    path = ROOT / 'jobs' / job_id / 'proposal-sketch.png'
    if not path.is_file():
        return ''
    try:
        from PIL import Image
        import io
        image = Image.open(path).convert('RGB')
        # The model likes to draw a sheet lying on a table. Trim that border away so the
        # thumbnail shows the drawing and not the desk it was photographed on.
        width, height = image.size
        if width > 400 and height > 400:
            image = image.crop((int(width * .09), int(height * .22), int(width * .91), int(height * .78)))
        image.thumbnail((1500, 1500))
        buffer = io.BytesIO()
        image.save(buffer, 'JPEG', quality=86)
        payload, mime = base64.b64encode(buffer.getvalue()).decode(), 'image/jpeg'
    except (ImportError, OSError):
        # No Pillow, or a file the drawing step left half written: the page still ships,
        # with the bytes as they are. A proposal never fails on its illustration.
        payload, mime = base64.b64encode(path.read_bytes()).decode(), 'image/png'
    return f'<img class="sketch" alt="The plan as one drawing" src="data:{mime};base64,{payload}">'


def listing(items, wrapper='ul'):
    if not items:
        return f'<{wrapper}><li>{OPEN}</li></{wrapper}>'
    return f'<{wrapper}>' + ''.join(f'<li>{value(i)}</li>' for i in items) + f'</{wrapper}>'


def milestones(items):
    if not items:
        return f'<div class="stone"><span>{OPEN}</span><b>{OPEN}</b></div>'
    out = []
    for index, stone in enumerate(items):
        selected = ' sel' if index == 0 else ''
        out.append(f'<div class="stone{selected}"><span>{value(stone.get("label"))}</span>'
                   f'<b>{value(stone.get("amount"))}</b></div>')
    return '\n      '.join(out)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('job_id')
    parser.add_argument('--file', required=True, help='JSON file, or - for stdin')
    parser.add_argument('--lang', default='en')
    args = parser.parse_args(argv)

    raw = sys.stdin.read() if args.file == '-' else pathlib.Path(args.file).read_text(encoding='utf-8')
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as error:
        abort(f'the proposal JSON does not parse: {error}')
    if not TEMPLATE.is_file():
        abort(f'template missing: {TEMPLATE}')

    weeks = int(data.get('weeks') or 6)
    if not 1 <= weeks <= 12:
        abort(f'weeks is {weeks}; a post-call plan runs 1 to 12 weeks.')
    labels = {**DEFAULT_LABELS, **(data.get('labels') or {})}
    today = datetime.date.today().strftime('%d %B %Y')

    page = TEMPLATE.read_text(encoding='utf-8')
    fields = {
        '{{LANG}}': esc(args.lang),
        '{{TITLE}}': value(data.get('headline')),
        '{{MEMBER}}': value(data.get('member')),
        '{{CLIENT}}': value(data.get('client')),
        '{{DATE}}': esc(data.get('date') or today),
        '{{HEADLINE}}': value(data.get('headline')),
        '{{PRICE}}': value(data.get('price')),
        '{{PRICE_NOTE}}': value(data.get('price_note')),
        '{{SKETCH}}': sketch(args.job_id),
        '{{WEEKS}}': str(weeks),
        '{{WEEK_HEADS}}': week_heads(weeks),
        '{{GANTT_ROWS}}': gantt_rows(data.get('rows') or [], weeks),
        '{{SUMMARY}}': value(data.get('summary')),
        '{{FACTS}}': call_notes(data.get('call_notes')),
        '{{INCLUDED}}': benefits(data.get('included')),
        '{{MILESTONES}}': milestones(data.get('milestones')),
        '{{STONES_NOTE}}': value(data.get('stones_note')),
        '{{FINE}}': ''.join(f'<p>{value(line)}</p>' for line in (data.get('fine') or [''])),
        '{{CTA}}': value(data.get('cta')),
        '{{CTA_HREF}}': esc(data.get('cta_href') or '#'),
    }
    for key, label in (('L_STATE', 'state'), ('L_PLAN', 'plan'),
                       ('L_INCLUDED', 'included'), ('L_STONES', 'stones')):
        fields['{{' + key + '}}'] = esc(labels[label])

    for marker, replacement in fields.items():
        page = page.replace(marker, replacement)
    left = [m for m in ('{{', '}}') if m in page]
    if left:
        abort('the template still holds unfilled markers; the field list and the template drifted.')

    out = ROOT / 'jobs' / args.job_id / 'proposal.html'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page, encoding='utf-8')
    opens = page.count('class="missing"')
    print(f'{out.relative_to(ROOT)} written, {opens} value(s) still open.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
