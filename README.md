# Upwork Blueprint

Win work on Upwork with Claude Code. Your profile, your job search, your applications and your pipeline, in one folder.

The full product goal and review standard are in [VISION.md](VISION.md).

## Quick start

1. Download this folder (or clone it) anywhere on your computer
2. Open a terminal in the folder and run `./setup.sh` once. It creates your own
   files, writes `.env` from the example and builds the audit report template
3. Run `claude`, then type `/context`. It asks about your background once, and
   every command after it writes from those answers

Skipping step 2 still works: every command walks you through what it needs, the
first time you run it. The setup script only saves you those interruptions.

## The path (run it in this order, it mirrors the course)

| Step | Command | What it does |
|------|---------|--------------|
| 1 | `/context` | Your work history, your offer, your terms and every result you can prove |
| 2 | `/audit` | Scores your Upwork profile and lists what to fix first |
| 3 | `/profile` | Writes your optimal profile, ready to paste into Upwork |
| 4 | `/find-jobs` | Finds and scores the jobs worth your Connects, straight into your cockpit |
| 5 | `/pitch-page` | A one-page pitch site plus the cover letter and bid you submit with your Loom |
| 6 | `/brief` | Your morning: what changed on Upwork, where every lead stands, and the messages that are due |
| 7 | `/lead-magnet` | A checked SEO audit once a local business sends its website |
| 8 | `/proposal` | Turns your sales call into the proposal you send on Upwork |
| 9 | `/won` | Turns a started contract into the handover brief for delivery |

Step 1 runs before the connector and before you have any profile at all. No
Upwork profile yet is the normal starting point here, not a problem to fix.

For a local business in conversation, `/lead-magnet <job id> <website>`
builds a private three-part SEO audit from live Firecrawl, Apify and
DataForSEO evidence. Nothing paid starts before the website is saved.

Two helpers: `/cockpit` shows your leads with the next command to copy, and
`/skip <job id> <reason>` takes a lead off the list so the next search learns
from it.

## Requirements

- [Claude Code](https://claude.com/claude-code) installed
- An Upwork freelancer account
- The official Upwork connector. `/audit` walks you through connecting it the first time
- Python 3, plus its packages: `python3 -m pip install -r requirements.txt`, then
  `python3 -m playwright install chromium`. `/lead-magnet` stops before its first
  paid call without them. If pip refuses because the system Python is managed,
  make a virtual environment first: `python3 -m venv .venv && source .venv/bin/activate`
- [Node.js](https://nodejs.org), the LTS version, for the cockpit and the report template
- Google Chrome, which `/pitch-page` uses to check the page on a phone screen
- The Vercel CLI and a Vercel login or `VERCEL_TOKEN` for public pitch pages

`./setup.sh` checks all of this and tells you what is still missing, per command.

## What it costs to run

Nothing until you run `/lead-magnet` or publish a pitch page. One full client
audit, measured on a real run on 27 September 2026: 48 API calls, $0.25, under
nine minutes. The keys are yours and the bills are yours; the package holds none.
`OPENAI_API_KEY` and `KIE_AI_API_KEY` are optional, and what they buy is named in
`.env.example`. Without `OPENAI_API_KEY` two chapters of the report say "not
measured" and the rest is unaffected. `KIE_AI_API_KEY` only saves a detour:
`/proposal` prints a prompt written for that client, and the page embeds whatever
image is saved as `jobs/<id>/proposal-sketch.png`, drawn by any model you already
use.

## What this will never do

It never submits a proposal, never sends a message, never buys Connects, and
never runs on its own in the background. It prepares the pitch page and the
application; you record the Loom, paste its link and submit on Upwork. Replies
are drafts you copy and send on Upwork yourself. The details are in
[references/upwork-rules.md](references/upwork-rules.md).

Stuck? Post in the community. The Help board answers same-day.

What in here is not ours, and under which licence, is listed in
[references/attribution.md](references/attribution.md). Everything else is the
author's: it ships to members to use in their own freelancing, not to republish or
resell.
