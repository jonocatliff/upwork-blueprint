---
description: Turns a started Upwork contract into a checked handover brief for delivery, with scope, milestones and client inputs.
argument-hint: "<job id>"
---

# /won

Turn a real contract into the handover brief the delivery pipeline starts from.
This command never accepts an offer, starts a contract or sends a message.

Read first: the job pipeline record, the saved thread, `jobs/<id>/proposal.md`
when it exists, and the final Upwork contract, plus `context/me.md`.

## ROADMAP

WHAT HAPPENS: verify that the contract started, confirm the delivery baseline and
write the handover brief. About five minutes.

I NEED FROM YOU: confirmation of any contract term the saved Upwork state does
not contain.

WHAT MIGHT GO WRONG: a verbal yes or pending offer is not a contract; proposal
scope may differ from final Upwork terms; missing access can block day one.

## Step 1: Contract gate

Run `python3 code/workspace.py` and `python3 code/pipeline.py get $ARGUMENTS`.
Continue immediately only when the pipeline status is won, which `/brief` sets
from a started contract. If the status is offer, ask whether the contract now
shows as started on Upwork. Only after an explicit yes may you run
`python3 code/pipeline.py set <id> won --note "Contract start confirmed by the member"`.
Anything earlier than offer is blocked. Never accept the offer for the member.

## Step 2: Confirm the delivery baseline

Compare the final Upwork contract terms the member can see with the proposal and
the saved conversation. Confirm only the differences or missing items, one
question at a time: contract type and amount or rate, funded first milestone for
fixed work, agreed scope and exclusions, start date, deadline, client inputs and
acceptance method. The contract wins every conflict.

## Step 3: Write the handover brief

Write `jobs/<id>/project.md` with exactly these sections:

- `## Contract baseline`: type, commercial terms, start and timing
- `## Outcome`: what the client receives
- `## Scope`: deliverables and explicit exclusions
- `## Client inputs`: access, material and decisions, with owners
- `## Milestones`: output, due condition and acceptance per phase
- `## Communication`: Upwork channel and the agreed update rhythm
- `## First actions`: the smallest real steps that unblock delivery

The first three non-empty lines name the client project, say when it was recorded
and give `**Next:**`, which is handing this brief to the delivery pipeline. No
invented dates, numbers, access or acceptance criteria. Run
`python3 code/document_check.py check project <id>` and fix every failure.

## Step 4: Report

Run `python3 code/client_workspace.py new <id>` once the brief exists. A job folder is a sales
artefact and stops mattering the day the contract starts; delivery needs one place per client.
It opens `clients/<slug>/` with `context.md` (who they are, what was sold, what was promised,
what access they owe), the brief copied in, and `inputs/`, `work/` and `delivered/`. Everything
under `clients/` is the member's own and never tracked.

Then fill the lines in `context.md` that read "not recorded yet" from the proposal and the
thread, and name in the report how many are still open. A fact nobody wrote down is a question
the client gets asked twice.

Use the completion report from `CLAUDE.md` and link the handover brief. The next
action is to start delivery from it. End with `Upwork calls: 0`. Nothing here touches the connector, and a `/brief`
run before this one counts its own calls in its own report.
