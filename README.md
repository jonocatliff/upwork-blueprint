# Upwork Blueprint

Win work on Upwork with Claude Code. Your profile, your job search, your applications and your pipeline, in one folder.

The full product goal and review standard are in [VISION.md](VISION.md).

## Quick start

1. Clone it anywhere on your computer:
   `git clone https://github.com/luka-commits/upwork-blueprint.git`
2. Open a terminal in the folder and run `./setup.sh` once. It creates your own
   files, writes `.env` with your unique Vercel project and builds the audit report template
3. Run `claude`, then type `/context`. It asks about your background once, and
   every command after it writes from those answers

Skipping step 2 still works: every command walks you through what it needs, the
first time you run it. The setup script only saves you those interruptions.

## The path (run it in this order, it mirrors the course)

| Step | Command | What it does |
|------|---------|--------------|
| 1 | `/context` | Your work history, your offer, your terms and every result you can prove |
| 2 | `/profile` | Measures your live profile, then writes the version that fixes it |
| 3 | `/find-jobs` | Ten leads a day worth applying to, scored against what you sell, straight into your cockpit |
| 4 | `/pitch-page` | A one-page pitch site plus the cover letter and bid you submit with your Loom |
| 5 | `/brief` | Your morning: what changed on Upwork, where every lead stands, and the messages that are due |
| 6 | `/lead-magnet` | A checked SEO audit once a local business sends its website |
| 7 | `/proposal` | Turns your sales call into the proposal you send, and says whether it is ready to start a project on |
| 8 | `/won` | Turns a started contract into the handover brief and the onboarding. Run it again after delivery to record what came out of it |

Step 1 runs before the connector and before you have any profile at all. No
Upwork profile yet is the normal starting point here, not a problem to fix.

For a local business in conversation, `/lead-magnet <job id> <website>`
builds a three-part SEO audit from live Firecrawl, Apify and DataForSEO
evidence. Nothing paid starts before the website is saved and you approve the
expected cost. After a name check and your hand review, publish the finished audit
to a public URL anyone holding the link can open. Your audits and pitch pages
share your own Vercel project, created on the first publish after `vercel login`.

One helper: `/cockpit` shows your leads with the next command to copy. A lead you
will not apply to leaves the list with `/find-jobs skip <job id> <reason>`, which
searches nothing, costs no Connects and keeps the reason the next search learns
from.

## Requirements

- [Claude Code](https://claude.com/claude-code) installed
- An Upwork freelancer account
- The official Upwork connector. `/profile` walks you through connecting it the first time
- Python 3, plus its packages: `python3 -m pip install -r requirements.txt`, then
  `python3 -m playwright install chromium`. `/lead-magnet` stops before its first
  paid call without them. If pip refuses because the system Python is managed,
  make a virtual environment first: `python3 -m venv .venv && source .venv/bin/activate`
- [Node.js](https://nodejs.org), the LTS version, for the cockpit and the report template
- Google Chrome, which `/pitch-page` uses to check the page on a phone screen
- The Vercel CLI and a Vercel login or `VERCEL_TOKEN` for public pitch pages

`./setup.sh` checks all of this and tells you what is still missing, per command.
`python3 code/tools_status.py` prints the same list from the other side: every
tool whether it is there or not, what each one buys you, and what you lose by
skipping it. `/context` shows you both on your first run, so nothing on this list
has to be settled before you start.

The Upwork connector is required for Upwork commands. Vercel is required to
publish pitch pages and audits. The list names what each other tool enables.

## What it costs to run

Nothing until you run `/lead-magnet` or publish a pitch page. One full client
audit, measured on a real run on 27 September 2026: 48 API calls, $0.25, under
nine minutes. The keys are yours and the bills are yours; the package holds none.
DataForSEO preflight requires $1 of credit, rather than estimating a whole run.
After your first audit, check the remaining balance and top it up before the next.
`OPENAI_API_KEY` and `KIE_AI_API_KEY` are optional, and what they buy is named in
`.env.example`. Without `OPENAI_API_KEY` two chapters of the report say "not
measured" and the rest is unaffected. `KIE_AI_API_KEY` only saves a detour:
`/proposal` prints a prompt written for that client, and the page embeds whatever
image is saved as `jobs/<id>/proposal-sketch.png`, drawn by any model you already
use.

## What appears in your folder

Everything below is yours and gitignored, so `git pull` never touches it.

- `context/me.md` - who you are and what you can back up
- `profile.md` - the profile to paste, written against what is live today
- `data/jobs.json` - your pipeline, written only by `code/pipeline.py`
- `jobs/<id>/` - one folder per job: the pitch page, the application, the audit,
  the proposal, the threads and the drafts
- `clients/<slug>/` - a won job: the brief, the inputs, the work, what you delivered

## What this will never do

It never submits a proposal, never buys Connects, and never runs on its own in
the background. It prepares the pitch page and the application; you record the
Loom, paste its link and submit on Upwork yourself, because an application spends
Connects and is a bid.

A reply to a client is the one thing it can put into the thread for you, and only
one message at a time, with the full text in front of you and your yes on that
one message. No answer leaves the draft for you to send by hand, which is also
what happens if anything about the send looks wrong. The details are in
[references/upwork.md](references/upwork.md).

One question about this is open, and you should know it before you run
anything. Upwork's own connector guidance asks you to check with their support
before scoring results with a model and before storing connector output. This
Blueprint does both: `/find-jobs` scores postings, and `prune` expires cached
job fields in `data/jobs.json` after 24 hours and saved chats in
`jobs/<id>/thread.json` after 90 days, so your follow-ups and feedback can learn
from them. Upwork's published rule is 24 hours for all of it; to follow it to
the letter, set `KEEP_CHAT_HOURS=24` in `.env`. Nobody here has asked
Upwork yet. The reasoning and the source are in
[RESEARCH.md](RESEARCH.md#what-upwork-says-about-automation).

Stuck? Open an issue on the repository, or ask in the community you got this
from. Include what you ran and what it printed; both are usually enough.

Three things in here are not ours. The tool logos in `templates/pitch/logos/`
come from Simple Icons under CC0; brand marks stay their owners' property and
only name a tool a client already runs. The diagram look in
`templates/pitch/diagram.js` follows the design system of diagram-design by
Cathryn Lavery, MIT licence, with no code copied from it. The ink drawing behind
the pitch page headline comes from the automatable.co landing page, used with
permission. Everything else is the author's: it ships to members to use in their
own freelancing, not to republish or resell.
