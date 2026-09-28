#!/usr/bin/env python3
"""The cockpit: your job pipeline and each lead's details, in the browser.

    python3 code/cockpit.py [--port 4321] [--no-open]   start it (installs and builds on first run)
    python3 code/cockpit.py state                         the list data as JSON
    python3 code/cockpit.py job <id>                      one job in full as JSON

The page itself is a small Next.js app in cockpit/. This script starts it, and it
is also where the app reads its data from, so the page reads the
same tested Python data as everything else. The app runs on this computer only
(127.0.0.1). Every status change goes through code/pipeline.py.
"""
import argparse
import datetime
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import time
import urllib.request
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import context_check
sys.path.insert(0, str(ROOT / 'code'))
import pipeline  # noqa: E402  (read-only use: load, jobs_dir)
import application_check  # noqa: E402
import pitch_check  # noqa: E402

APP = ROOT / 'cockpit'
JOBS_DIR = pipeline.jobs_dir()


def artifacts(job_id):
    folder = JOBS_DIR / job_id
    if not folder.is_dir():
        return []
    internal = {'thread.json', 'replies.json', 'outbox.json'}
    return sorted(p.name for p in folder.iterdir()
                  if p.is_file() and not p.name.startswith('.') and p.name not in internal)


# What a member is looking at when they open a lead: the thing a client reads, the thing
# they still have to send, and the raw material behind both. A flat list of eleven files
# hides the first two behind the third.
CLIENT_FACING = {'pitch.html', 'proposal.html', 'lead-magnet.html'}
TO_SEND = {'application.md', 'proposal.md', 'project.md'}


def role(name):
    """Four roles: what the client reads, what the member still has to send, images as
    material, and everything else as a record of what happened."""
    if name in CLIENT_FACING:
        return 'client'
    if name in TO_SEND:
        return 'send'
    if name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif')):
        return 'asset'
    return 'data'


def artifact_health(job):
    """Return gate-backed readiness without hiding saved drafts from the member."""
    folder = JOBS_DIR / str(job.get('id') or '')
    valid, errors = [], {}
    proof_path = pathlib.Path(os.environ.get('BLUEPRINT_CONTEXT') or ROOT / 'context') / 'me.md'
    proof = (context_check.proof_only(proof_path.read_text(encoding='utf-8'))
             if proof_path.is_file() else '')
    for name in artifacts(str(job.get('id') or '')):
        path = folder / name
        problems = None
        try:
            # Every client-facing file has a gate in this repo. Two of them ran here and the
            # rest showed green without a check, which is worse than no tile: a member reads
            # a green proposal as a checked proposal.
            if name in ('pitch.html', 'proposal.html'):
                problems = pitch_check.check_page(path)
            elif name == 'application.md':
                problems, _, _, _, _ = application_check.check(
                    path.read_text(encoding='utf-8'), str(job.get('title') or ''), proof)
            elif name in ('proposal.md', 'project.md'):
                import document_check  # noqa: E402  (same folder, imported where it is used)
                kind = 'proposal' if name == 'proposal.md' else 'project'
                problems = document_check.validate_artifact(kind, path.read_text(encoding='utf-8'), proof)
            elif name == 'lead-magnet.html':
                import lead_magnet_check  # noqa: E402  (same folder, imported where it is used)
                problems = lead_magnet_check.check_page(path)
        except (OSError, UnicodeError):
            problems = ['file could not be read']
        if problems is None or not problems:
            valid.append(name)
        else:
            errors[name] = problems
    return valid, errors


def read_json(folder, name):
    file = folder / name
    try:
        return json.loads(file.read_text(encoding='utf-8')) if file.is_file() else None
    except (OSError, json.JSONDecodeError):
        return None


def client_waiting(thread):
    """True when the room waits on the member and the client has written."""
    if not isinstance(thread, dict) or not thread.get('room_id') \
            or thread.get('awaiting_reply_from') != 'you':
        return False
    return any(isinstance(m, dict) and m.get('kind') != 'event' and m.get('from') != 'me'
               for m in thread.get('messages') or [])


def job_view(job_id):
    """One job for the full lead view: the record, its files with dates, the saved thread."""
    job = next((j for j in pipeline.load() if j.get('id') == job_id), None)
    if not job:
        return None
    j = dict(job)
    folder = JOBS_DIR / job_id
    files = []
    for name in artifacts(job_id):
        stat = (folder / name).stat()
        files.append({
            'name': name,
            'role': role(name),
            'at': datetime.datetime.fromtimestamp(
                stat.st_mtime, datetime.timezone.utc).isoformat(timespec='seconds'),
            'version': f'{stat.st_mtime_ns}-{stat.st_size}',
        })
    j['files'] = files
    j['valid_artifacts'], j['artifact_errors'] = artifact_health(job)
    j['thread'] = read_json(folder, 'thread.json')
    j['client_waiting'] = client_waiting(j['thread'])
    j['artifacts'] = [f['name'] for f in files]
    j['replies'] = read_json(folder, 'replies.json')
    return j


def card(job):
    """A record as the list needs it: everything but the full posting."""
    j = {k: v for k, v in job.items() if k not in ('description',)}
    details = dict(job.get('details') or {})
    j['has_posting'] = bool(details.pop('description', None) or job.get('description'))
    j['details'] = details
    j['artifacts'] = artifacts(job.get('id', ''))
    j['valid_artifacts'], j['artifact_errors'] = artifact_health(job)
    j['client_waiting'] = client_waiting(read_json(JOBS_DIR / str(job.get('id') or ''), 'thread.json'))
    return j


def daily_target():
    """The member's applications-per-day goal from context/me.md, or None."""
    me = pathlib.Path(os.environ.get('BLUEPRINT_CONTEXT') or ROOT / 'context') / 'me.md'
    if me.is_file():
        m = re.search(r'Applications per day:\*\*\s*(\d+)', me.read_text(encoding='utf-8'))
        if m:
            return int(m.group(1))
    return None


FUNNEL = ('applied', 'replied', 'call', 'offer', 'won')


def funnel(jobs):
    """How many leads ever reached each stage, from applied to won."""
    # The mandatory stages count as reached: nobody wins without applying, and nobody
    # is offered without an answer. The call is the exception, because it is optional:
    # crediting it to every lead that reached an offer would invent calls nobody had.
    def seen(job):
        stages = [job.get('status')] + [h.get('status') for h in job.get('history') or []
                                        if isinstance(h, dict)]
        rank = max((FUNNEL.index(s) + 1 for s in stages if s in FUNNEL), default=0)
        return rank, 'call' in stages
    marks = [seen(job) for job in jobs]
    return {stage: sum(1 for rank, had_call in marks
                       if (had_call if stage == 'call' else rank > index))
            for index, stage in enumerate(FUNNEL)}


OUTREACH_WEEKS = 12


def outreach(jobs, weeks=OUTREACH_WEEKS, today=None):
    """Applications sent per week, oldest first, so a member sees their own rhythm.

    Counted from each lead's own history, which is where `/brief` records the send,
    so a week with nothing in it is a week nothing went out rather than a gap in the
    data. Weeks start on Monday and the last one is the current, unfinished week.
    """
    today = today or datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())
    starts = [monday - datetime.timedelta(weeks=back) for back in range(weeks - 1, -1, -1)]
    counts = {start.isoformat(): 0 for start in starts}
    first = starts[0]
    for job in jobs:
        for event in job.get('history') or []:
            if not isinstance(event, dict) or event.get('status') != 'applied':
                continue
            stamp = str(event.get('at') or '')[:10]
            try:
                when = datetime.date.fromisoformat(stamp)
            except ValueError:
                continue
            if when < first or when > today:
                continue
            week = when - datetime.timedelta(days=when.weekday())
            key = week.isoformat()
            if key in counts:
                counts[key] += 1
    return [{'week': key, 'count': value} for key, value in counts.items()]


def build_state():
    jobs = pipeline.load()
    return {
        'generated_at': datetime.datetime.now().isoformat(timespec='seconds'),
        'jobs': [card(j) for j in jobs],
        'sync': last_sync(),
        'tracker': {'goal': daily_target(),
                    'done': pipeline.applied_on(jobs, datetime.date.today().isoformat())},
        'funnel': funnel(jobs),
        'outreach': outreach(jobs),
    }


def last_sync():
    """When /brief last brought the pipeline in line with Upwork, and what it found."""
    f = pathlib.Path(os.environ.get('BLUEPRINT_DATA') or ROOT / 'data') / 'sync.json'
    try:
        return json.loads(f.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        return None


# --- starting the app ---------------------------------------------------------------

def needs_build():
    """A build is stale when any source file is newer than it."""
    build = APP / '.next' / 'BUILD_ID'
    if not build.is_file():
        return True
    built = build.stat().st_mtime
    sources = [APP / 'package.json', APP / 'next.config.mjs']
    for folder in ('app', 'components', 'lib'):
        sources += [p for p in (APP / folder).rglob('*') if p.is_file()]
    return any(p.stat().st_mtime > built for p in sources if p.exists())


def npm(*args):
    """npm on macOS, Linux and Windows (where it is a .cmd file and needs the shell)."""
    exe = shutil.which('npm')
    if not exe:
        print('The cockpit needs Node.js. Install the LTS version from https://nodejs.org, '
              'open a new terminal, then run this again.', file=sys.stderr)
        sys.exit(1)
    return [exe, *args], os.name == 'nt'


def port_busy(port):
    import socket
    with socket.socket() as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


def stop_child(child):
    """Stop only the server process this launch created, without waiting forever."""
    try:
        child.terminate()
    except OSError:
        return
    try:
        child.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            child.kill()
        except OSError:
            return
        try:
            child.wait(timeout=5)
        except subprocess.TimeoutExpired:
            pass


def start_server(port):
    """Start the built cockpit and wait for it to answer.

    Returns the running child, or the reason it never answered: the exit code when
    the server gave up on its own, and None when it simply never came up.
    """
    cmd, shell = npm('run', 'start', '--', '-p', str(port))
    env = dict(os.environ, BLUEPRINT_ROOT=str(ROOT))
    child = subprocess.Popen(cmd, cwd=APP, env=env, shell=shell)
    url = f'http://127.0.0.1:{port}/'
    for _ in range(60):
        try:
            response = urllib.request.urlopen(url, timeout=1)
            response.close()
            return child, None
        except OSError:
            exit_code = child.poll()
            if exit_code is not None:
                return None, exit_code
            time.sleep(0.5)
    stop_child(child)
    return None, None


def build(clean):
    """Build the cockpit, from scratch when the folder on disk is not trustworthy."""
    if clean:
        shutil.rmtree(APP / '.next', ignore_errors=True)
    cmd, shell = npm('run', 'build')
    subprocess.run(cmd, cwd=APP, check=True, shell=shell)


def serve(port, open_browser):
    # An older cockpit still holding the port would answer for us with stale files
    # and a page stuck on "Loading.", so a busy port stops the start instead.
    if port_busy(port):
        print(f'Port {port} is taken, most likely by a cockpit that is still running. '
              f'Stop that one (Ctrl+C in its terminal) or start this one with --port {port + 1}.', file=sys.stderr, flush=True)
        return 1
    if not (APP / 'node_modules').is_dir():
        print('First start: installing the cockpit (about a minute, only this once).', flush=True)
        cmd, shell = npm('install', '--no-audit', '--no-fund')
        subprocess.run(cmd, cwd=APP, check=True, shell=shell)
    # A build folder left behind by a development server, or by a build that was
    # interrupted, mixes two kinds of output: the production server then dies on a
    # missing chunk although the build reported success. So the first build of a
    # session starts from scratch.
    if needs_build():
        print('Building the cockpit (about a minute after each update).', flush=True)
        build(clean=True)
    # The URL is printed and the browser opened only once the server has answered a
    # request. A tab opened a second early shows the member an error page for a
    # cockpit that is about to be fine, and they close it before it is.
    url = f'http://127.0.0.1:{port}/'
    child, exit_code = start_server(port)
    # Only a server that never answered. A corrupt build keeps the process alive and
    # logging, which is exactly this case; an early exit is a port or a config and a
    # rebuild would not touch it. `needs_build` compares timestamps, so a build that
    # is current and unusable stays current forever.
    if child is None and exit_code is None:
        print('The cockpit did not start. Rebuilding it from scratch, about a minute.',
              file=sys.stderr, flush=True)
        build(clean=True)
        child, exit_code = start_server(port)
    if child is None:
        if exit_code is not None:
            print(f'Cockpit failed to start: its server exited with code {exit_code}.',
                  file=sys.stderr, flush=True)
            return exit_code or 1
        print(f'Cockpit failed to start: {url} did not become ready during startup.',
              file=sys.stderr, flush=True)
        return 1
    print(f'Cockpit running at {url}  (Ctrl+C stops it)', flush=True)
    if open_browser:
        webbrowser.open(url)
    try:
        return child.wait()
    except KeyboardInterrupt:
        child.terminate()
        return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('what', nargs='?', default='serve', choices=('serve', 'state', 'job'))
    ap.add_argument('job_id', nargs='?')
    ap.add_argument('--port', type=int, default=4321)
    ap.add_argument('--no-open', action='store_true')
    args = ap.parse_args(argv)
    if args.what == 'state':
        print(json.dumps(build_state(), ensure_ascii=False))
        return 0
    if args.what == 'job':
        job = job_view(args.job_id or '')
        print(json.dumps(job, ensure_ascii=False))
        return 0 if job else 1
    return serve(args.port, not args.no_open)


if __name__ == '__main__':
    sys.exit(main())
