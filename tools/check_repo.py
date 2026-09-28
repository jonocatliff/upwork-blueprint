#!/usr/bin/env python3
"""Does this repo work for a stranger who just cloned it? The release gate.

Mechanical checks only, the kind that surfaced as breaks on a real clone of the
repo this one grew out of:

    1. No personal data survived: names, domains, ids, machine paths
    2. Nothing shipped speaks German, not even an identifier
    3. No em-dashes in anything shipped
    4. Every path a command mentions exists, or is the member's own file
    5. Every `python3 code/X.py cmd` a command calls is a real subcommand
    6. Every starter lands on a gitignored path, so a member never commits it
    7. Every command has a description in its frontmatter

Exit 1 on any finding, so it gates a release rather than being read politely.

    python3 tools/check_repo.py [--quiet]
"""
import ast
import pathlib
import json
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
COMMANDS = ROOT / '.claude' / 'commands'
SELF = 'tools/check_repo.py'

# Traces of the machine this was built on. A hit means the separation missed something.
# The names themselves live in tools/leaks.txt, which does not ship: a gate that
# prints "remove this name" is the last place that name should be written down,
# and the person this package is handed to would read their own name in it.
def _private_patterns():
    listed = pathlib.Path(__file__).with_name('leaks.txt')
    if not listed.is_file():
        return []
    out = []
    for line in listed.read_text(encoding='utf-8').splitlines():
        line = line.strip()
        if line and not line.startswith('#'):
            # From the right: the pattern itself may contain alternations.
            pattern, _, label = line.rpartition('|')
            out.append((pattern.strip(), (label or 'private material').strip()))
    return out


LEAKS = _private_patterns() + [
    (r'\b1898663420131815612\b', 'a specific Upwork org id'),
    (r'~0[0-9a-f]{17}', 'an Upwork profile id'),
    (r'/Users/[a-z]+/', 'an absolute home directory'),
]

# German function words and orthography. A shipped line carrying one is text a
# member will read in the wrong language.
GERMAN = re.compile(
    r'[äöüßÄÖÜ]|\b(nicht|keine[rnms]?|kein|eine[rnms]?|und|oder|wird|werden|weil|damit|'
    r'sondern|statt|schon|noch|Datei|Ordner|Zeile|erledigt|fehlt|liegt|gibt|nichts|'
    r'etwas|dieser|diesem|diesen|deine[rnms]?|selbst|bereits|jeder|jede[nrms]?)\b',
    re.IGNORECASE)
LANGUAGE_DATA_MARKER = '# multilingual-data'

# German identifiers survive a translation because no gate reads them. A member
# who opens the file to change one number should not have to guess at the words.
GERMAN_PARTS = {
    'abschnitt', 'anlauf', 'anzahl', 'auswahl', 'begriff', 'begriffe', 'bericht', 'branche',
    'ergebnis', 'fehler', 'inhalt', 'kopf', 'laden', 'pfad', 'quelle', 'seite', 'seiten',
    'titel', 'versuch', 'ziel',
    'branchen', 'datei', 'fehlend', 'fuellwort', 'fuellworte', 'gemessen', 'lauf',
    'laeufe', 'leer', 'mindestrest', 'mitte', 'ordner', 'ortsfrei', 'ortsfreier',
    'passwort', 'pruefe', 'pruefen', 'stichwort', 'suchbegriff', 'verlauf', 'wert',
    'werte', 'zeile',
}

# Files a member creates or a command writes at runtime. A command may point at
# them although a fresh clone does not have them yet.
MEMBER_PATHS = ('context/', 'data/', 'jobs/')


# The cockpit app's own source. Its texts reach the member like any command does.
COCKPIT = ('cockpit/**/*.ts', 'cockpit/**/*.tsx', 'cockpit/**/*.mjs', 'cockpit/**/*.css')


def shipped(*globs):
    """Every tracked-or-trackable file matching the globs: what a stranger receives."""
    found = []
    for g in globs:
        found += [p for p in ROOT.glob(g) if p.is_file() and '.git/' not in str(p)]
    if not found:
        return []
    rels = [str(p.relative_to(ROOT)) for p in found]
    r = subprocess.run(['git', 'check-ignore', '--stdin'], cwd=ROOT,
                       input='\n'.join(rels), capture_output=True, text=True)
    ignored = set(r.stdout.split('\n'))
    return [p for p, rel in zip(found, rels) if rel not in ignored and rel != SELF]


def lines_of(p):
    try:
        return p.read_text(encoding='utf-8').splitlines()
    except (UnicodeDecodeError, OSError):
        return []


def check_leaks():
    findings = []
    # No file is exempt. The vendored report shell used to be, for its German
    # comments, but no leak pattern was ever labelled German, so the exemption
    # matched nothing and would have raised on the first template file it reached.
    # Comments in another language are check_language's and the build's business.
    for p in shipped('**/*.md', '**/*.py', '**/*.html', '**/*.json', '**/*.js',
                     'templates/**/*.ts', 'templates/**/*.tsx', *COCKPIT):
        for i, line in enumerate(lines_of(p), 1):
            for pattern, what in LEAKS:
                m = re.search(pattern, line)
                if m:
                    findings.append(f'{p.relative_to(ROOT)}:{i} carries {what}: {m.group(0)}')
    return findings


def check_language():
    findings = []
    for p in shipped('**/*.md', '**/*.py', *COCKPIT):
        for i, line in enumerate(lines_of(p), 1):
            if GERMAN.search(line) and LANGUAGE_DATA_MARKER not in line:
                findings.append(f'{p.relative_to(ROOT)}:{i} is German: "{line.strip()[:60]}"')
                break
    return findings


def check_identifiers():
    """Names a member reads while editing: functions, constants, arguments."""
    findings = []
    for p in shipped('code/*.py', 'tools/*.py'):
        try:
            tree = ast.parse(p.read_text(encoding='utf-8'))
        except SyntaxError:
            continue
        named = set()
        for n in ast.walk(tree):
            if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)):
                named.add((n.name, n.lineno))
                named |= {(a.arg, n.lineno) for a in n.args.args + n.args.kwonlyargs}
            elif isinstance(n, ast.ClassDef):
                named.add((n.name, n.lineno))
            elif isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store):
                named.add((n.id, n.lineno))
        for name, line in sorted(named, key=lambda x: x[1]):
            parts = re.split(r'_|(?<=[a-z])(?=[A-Z])', name.lower())
            german = sorted(set(parts) & GERMAN_PARTS)
            if german:
                findings.append(f'{p.relative_to(ROOT)}:{line} names something in German: '
                                f'{name} ({", ".join(german)})')
    return findings


def check_em_dashes():
    findings = []
    for p in shipped('**/*.md', '**/*.py', '**/*.html', *COCKPIT):
        hits = [i for i, line in enumerate(lines_of(p), 1) if '—' in line]
        if hits:
            more = f' (+{len(hits) - 1} more)' if len(hits) > 1 else ''
            findings.append(f'{p.relative_to(ROOT)}:{hits[0]} has an em-dash{more}')
    return findings


def check_report_shell():
    """The built report is the only file a client ever opens. Nothing of ours in it.

    Both stylesheets live in a template literal, so their comments are string content
    that no minifier removes. The built report shipped its engineering commentary to
    the client until `templates/lead-magnet/vite.config.ts` started stripping it, and
    this check is what keeps that plugin in place.
    """
    built = ROOT / 'templates' / 'lead-magnet' / 'dist' / 'index.html'
    if not built.is_file():
        return []
    page = built.read_text(encoding='utf-8', errors='replace')
    findings = []
    # `/*!` is a bundler's licence banner and `/*$vite$` its own marker. Everything
    # else in a comment came from us.
    ours = [m for m in re.findall(r'/\*.{0,80}', page, re.S)
            if not m.startswith(('/*!', '/*$'))]
    if ours:
        findings.append('the built report carries source comments, so the strip plugin in '
                        f'templates/lead-magnet/vite.config.ts is not running: {ours[0][:60]!r}')
    for pattern, what in LEAKS:
        m = re.search(pattern, page)
        if m:
            findings.append(f'the built report carries {what}: {m.group(0)}')
    return findings


def check_paths():
    findings = []
    pat = re.compile(r'`((?:context|data|jobs|code|references|starters|templates|tools)/[\w./-]+)`')
    for p in sorted(COMMANDS.glob('*.md')):
        for m in pat.finditer(p.read_text(encoding='utf-8')):
            rel = m.group(1)
            if (ROOT / rel).exists() or rel.startswith(MEMBER_PATHS):
                continue
            findings.append(f'{p.name}: points at {rel}, which does not exist')
    return findings


def check_subcommands():
    findings = []
    pat = re.compile(r'python3 (code/[\w_]+\.py) ([a-z][\w-]*)')
    seen = set()
    for p in sorted(COMMANDS.glob('*.md')) + [ROOT / 'CLAUDE.md']:
        for m in pat.finditer(p.read_text(encoding='utf-8')):
            script, cmd = m.groups()
            if (script, cmd) in seen:
                continue
            seen.add((script, cmd))
            if not (ROOT / script).is_file():
                findings.append(f'{p.name}: calls {script}, which does not exist')
                continue
            r = subprocess.run([sys.executable, str(ROOT / script), cmd, '--help'],
                               capture_output=True, text=True, cwd=ROOT)
            if r.returncode != 0 and 'invalid choice' in r.stderr:
                findings.append(f'{p.name}: calls `{script} {cmd}`, not a valid subcommand')
    return findings


def check_starters_ignored():
    """Both halves of the git-pull promise: the starter ships, its copy never does.

    The first half failed once: a bare `context/` ignore pattern also matched
    starters/context/, so the starters silently never shipped.
    """
    findings = []
    starters = ROOT / 'starters'

    def ignored(rel):
        return subprocess.run(['git', 'check-ignore', '-q', rel], cwd=ROOT).returncode == 0

    for p in sorted(x for x in starters.rglob('*') if x.is_file()):
        rel = str(p.relative_to(starters))
        if ignored(f'starters/{rel}'):
            findings.append(f'starters/{rel} is gitignored itself, so it never ships')
        if not ignored(rel):
            findings.append(f'starters/{rel} lands on {rel}, which is not gitignored: '
                            f'a member filling it in would publish it')
    return findings


def check_frontmatter():
    findings = []
    for p in sorted(COMMANDS.glob('*.md')):
        head = p.read_text(encoding='utf-8')[:800]
        if not head.startswith('---') or 'description:' not in head:
            findings.append(f'{p.name}: no description in its frontmatter')
    return findings


def check_call_count():
    """Every command closes with the call count, the member's only rate-limit evidence."""
    findings = []
    for p in sorted(COMMANDS.glob('*.md')):
        if 'Upwork calls:' not in p.read_text(encoding='utf-8'):
            findings.append(f'{p.name}: no "Upwork calls:" line for the report to end on')
    return findings


def check_self_contained():
    """The package carries its own instructions.

    A reference that reaches for a skill or a path on the builder's machine works
    for exactly one person, and nothing tells the next member why their run came
    out different. This used to be a test; the test folder is gone, the rule is not.
    """
    findings = []
    if (ROOT / '.claude' / 'skills').exists():
        findings.append('.claude/skills/ exists: the commands are the only entry points')
    for p in sorted((ROOT / 'references').glob('*.md')) + sorted(COMMANDS.glob('*.md')):
        for i, line in enumerate(lines_of(p), 1):
            for outside in ('~/.claude', 'write-as-', '.claude/skills'):
                if outside in line:
                    findings.append(f'{p.relative_to(ROOT)}:{i} depends on {outside}, which no member has')
    return findings


def check_command_set():
    """The eight commands of the path plus the one helper, and nothing else."""
    expected = {'brief', 'cockpit', 'context', 'find-jobs', 'lead-magnet',
                'pitch-page', 'profile', 'proposal', 'won'}
    found = {p.stem for p in COMMANDS.glob('*.md')}
    findings = [f'command missing: /{name}' for name in sorted(expected - found)]
    findings += [f'command not in the documented set: /{name}' for name in sorted(found - expected)]
    # Whoever writes for a member or a client reads the same copy rules, or four
    # commands drift into four voices.
    for name in ('pitch-page', 'profile', 'proposal', 'brief'):
        p = COMMANDS / f'{name}.md'
        if p.is_file() and 'references/copy.md' not in p.read_text(encoding='utf-8'):
            findings.append(f'{name}.md writes for a reader without reading references/copy.md')
    return findings


def check_facts_contract():
    """A reference that carries numbers carries the day they were read.

    This used to check a structured fact file. Nothing read that file, and every
    number in it also lived in prose, so the file is gone and the rule moved to
    where the numbers actually are. A reference with a figure in it and no date
    anywhere is folklore that looks like measurement.
    """
    dated = re.compile(r'\b(?:[12]?\d|3[01]) (?:January|February|March|April|May|June|July|'
                       r'August|September|October|November|December) 20\d\d\b')
    has_number = re.compile(r'(?<![\w.])\d{2,}(?![\w.])')
    findings = []
    for path in sorted((ROOT / 'references').glob('*.md')):
        text = path.read_text(encoding='utf-8')
        # A figure inside backticks is an example of what to write, not a claim
        # about the world: `37 Google reviews` shows a sentence shape.
        text = re.sub(r'`[^`]*`', '', text)
        if has_number.search(text) and not dated.search(text):
            findings.append(f'references/{path.name} states figures with no date '
                            'anywhere: that is folklore, not a measurement')
    return findings


def check_vision():
    findings = []
    vision = ROOT / 'VISION.md'
    if not vision.is_file():
        return ['VISION.md is missing']
    value = vision.read_text(encoding='utf-8')
    for phrase in ('complete local Upwork operating system', 'No gimmicks', 'Review contract'):
        if phrase not in value:
            findings.append(f'VISION.md is missing "{phrase}"')
    links = {
        'CLAUDE.md': 'VISION.md',
        'cockpit/PRINCIPLES.md': '../VISION.md',
    }
    for path, link in links.items():
        if link not in (ROOT / path).read_text(encoding='utf-8'):
            findings.append(f'{path} does not link to {link}')
    return findings


WRITING_BUDGET = 3050  # raised once, 28.09.2026, to pay for /won's onboarding step


def check_writing_budget():
    """The nine commands and the references share one line budget.

    Every session wants to add a sentence, and nothing ever wants to remove one, so a
    year of good intentions turns a command into a patchwork nobody reads to the end.
    A shared ceiling makes an addition cost a deletion, which is the only thing that
    forces a rule to be sharpened instead of duplicated. Raise it deliberately, in its
    own commit, or not at all.
    """
    files = sorted((ROOT / '.claude' / 'commands').glob('*.md')) + sorted((ROOT / 'references').glob('*.md'))
    counts = {path: len(path.read_text(encoding='utf-8').splitlines()) for path in files}
    total = sum(counts.values())
    if total <= WRITING_BUDGET:
        return []
    worst = sorted(counts.items(), key=lambda kv: -kv[1])[:3]
    names = ', '.join(f'{path.name} {n}' for path, n in worst)
    return [f'commands and references total {total} lines, over the budget of {WRITING_BUDGET} '
            f'(largest: {names}). Shorten something before adding more.']


def check_starter_fields():
    """Every field the code reads from me.md has to exist in the shipped empty.

    A field added to the code and not to the starter is the worst kind of missing: the
    member never sees a question, the command silently falls back to a constant, and the
    figure that decides his day is one nobody chose. Three fields had already drifted
    apart this way before this check existed.
    """
    starter = (ROOT / 'starters' / 'context' / 'me.md').read_text(encoding='utf-8')
    wanted = set()
    for path in sorted((ROOT / 'code').glob('*.py')):
        wanted.update(re.findall(r"me_number\(\s*['\"]([^'\"]+)['\"]", path.read_text(encoding='utf-8')))
    return [f'starters/context/me.md has no "**{name}:**", which code/ reads'
            for name in sorted(wanted) if f'**{name}:**' not in starter]


CHECKS = [
    ('personal data', check_leaks),
    ('language', check_language),
    ('identifiers', check_identifiers),
    ('em-dashes', check_em_dashes),
    ('built report', check_report_shell),
    ('command paths', check_paths),
    ('script subcommands', check_subcommands),
    ('starters gitignored', check_starters_ignored),
    ('command frontmatter', check_frontmatter),
    ('call count line', check_call_count),
    ('self-contained', check_self_contained),
    ('command set', check_command_set),
    ('fact contract', check_facts_contract),
    ('product vision', check_vision),
    ('writing budget', check_writing_budget),
    ('starter fields', check_starter_fields),
]


def main():
    quiet = '--quiet' in sys.argv
    total = 0
    for label, fn in CHECKS:
        found = fn()
        total += len(found)
        if found:
            print(f'\n{label}:')
            for f in found:
                print(f'  {f}')
        elif not quiet:
            print(f'ok  {label}')
    if total:
        print(f'\n{total} finding(s). Fix before publishing.')
        return 1
    if not quiet:
        print('\nClean.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
