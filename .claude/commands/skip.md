---
description: Takes a lead you will not apply to off the list and records why, so the next /find-jobs scores better. Sends nothing.
argument-hint: "<job id> <reason>"
---

# /skip

Take one Not applied lead off the cockpit list and keep the reason. `/find-jobs`
reads these reasons to calibrate the next search. This command never calls
Upwork.

Short roadmap: check the lead, record the reason, report. No stops unless the
reason is missing.

## Step 1: Check the lead

Run `python3 code/pipeline.py get <job id>`. Only a Not applied lead (status
`new`) can be skipped. A lead that is further along moves through `/brief`; say so
and stop.

If no reason was given, ask for one line and wait. A useful reason names the fact
that rules the job out, such as budget, scope, tools or client, not a mood.

## Step 2: Record it

Run `python3 code/pipeline.py set <job id> skipped --note "not a fit: <reason>"`.
Keep the prefix `not a fit:`, because `python3 code/jobs.py rules` reads it.

## Step 3: Report

One line: the job title, the reason as saved, and that the lead left the cockpit
list. End with `Upwork calls: 0`.
