#!/usr/bin/env python3
"""The gate for the two files every other command writes from.

    python3 code/context_check.py [--quiet]

/context fills context/me.md and context/proof.md. Everything after it, from the
profile to a proposal, quotes those files, so a starter line left in place turns
into "not answered yet" inside something a client reads. This counts what is
still open and refuses a proof entry that cannot be checked.
"""
import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
ME = ROOT / 'context' / 'me.md'
PROOF = ROOT / 'context' / 'proof.md'
STARTER = 'not answered yet'
EMPTY_SECTION = 'nothing recorded yet'

# Without these, a later command either invents the answer or stops mid-run.
REQUIRED = (
    'Profession',
    'The one thing you want to be hired for',
    'Services you sell',
    'What you do NOT do',
    'Hourly rate',
    'Timezone and hours you answer messages',
    'Applications per day',
)
STATUS = re.compile(r'\b(verified|pending)\b', re.I)
CHECKABLE = re.compile(r'(where to check|checked at|source:|https?://|upwork\.com)', re.I)


def field(text, label):
    """The value behind a bold label, or None when the label is missing."""
    match = re.search(rf'^\*\*{re.escape(label)}[^:]*:\*\*\s*(.*)$', text, re.M | re.I)
    return match.group(1).strip() if match else None


def check_me(text):
    findings = []
    for label in REQUIRED:
        value = field(text, label)
        if value is None:
            findings.append(f'me.md has no "{label}" line')
        elif not value or STARTER in value.lower():
            findings.append(f'me.md: {label} is still unanswered')
    return findings


def entries(text):
    """Every proof block: a heading line plus the lines under it."""
    blocks = []
    current = None
    for line in text.splitlines():
        if line.startswith('## '):
            current = line[3:].strip()
            continue
        if current and line.strip():
            blocks.append((current, line.strip()))
    return blocks


def check_proof(text):
    findings = []
    body = [(section, line) for section, line in entries(text)
            if EMPTY_SECTION not in line.lower() and not line.startswith('One block per')]
    for section, line in body:
        if not line.startswith(('-', '*', '**')) and not line[0].isdigit():
            continue
        if not STATUS.search(line):
            findings.append(f'proof.md, {section}: no verified or pending status: "{line[:50]}"')
        elif re.search(r'\bverified\b', line, re.I) and not CHECKABLE.search(line):
            findings.append(f'proof.md, {section}: verified with no place to check it: "{line[:50]}"')
    return findings


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('me', nargs='?', default=ME, type=pathlib.Path,
                        help='context/me.md by default')
    parser.add_argument('proof', nargs='?', default=PROOF, type=pathlib.Path,
                        help='context/proof.md by default')
    parser.add_argument('--quiet', action='store_true', help='print nothing when clean')
    args = parser.parse_args(argv)
    findings = []
    for path, check in ((args.me, check_me), (args.proof, check_proof)):
        if not path.is_file():
            findings.append(f'{path} is missing. Run python3 code/workspace.py')
            continue
        findings += check(path.read_text(encoding='utf-8'))
    if findings:
        for f in findings:
            print(f'FAIL  {f}')
        print(f'\n{len(findings)} open. Ask the member, never fill it in for them.')
        return 1
    if not args.quiet:
        print('PASS: your context and proof files answer what every command needs.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
