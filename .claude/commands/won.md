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

**Read the contract yourself before asking anything.** `list_contracts` action `search`
on active contracts returns the type, the rate or amount and the dates, and
`list_milestones` returns the funded first milestone for fixed work. Asking the member to
retype what the connector will hand over is the kind of question this system exists to
remove. The one thing you cannot verify is the join: a contract without a job id is
matched by title, so name which contract you took and let them confirm it is this job.

Then compare what you read with `jobs/<id>/proposal.md` and the saved conversation, and
put only the differences to them, one question at a time: contract type and amount or
rate, funded first milestone, agreed scope and exclusions, start date, deadline, client
inputs and acceptance method. The contract wins every conflict, and a difference is
written into the brief as a difference rather than quietly resolved.

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

## Step 4: The start, and whether there is a call for it

**Ask first whether there will be an onboarding call.** Plenty of jobs do not have one: a
small fixed piece with the brief already agreed starts faster in writing, and forcing a
meeting onto a client who wants the work done is a bad first impression. So ask, once, and
build whichever of the two the answer calls for.

**With a call**, write the agenda into `project.md` under `## First actions`, in this order,
because it is the order that gets everything answered: the roadmap from the proposal read
back in four or five steps so the client hears their own plan again; what the member needs
from them, named as a list with an owner each; who decides on the client side and who else
must see the work; how they will hear from the member and how fast a question gets answered;
and the first milestone with what "done" means for it. Everything the client owes gets a
date on the call, not an intention. End it by naming the single first deliverable and when
it lands.

**Without a call**, the same list goes out as one message and a request: the roadmap in four
lines, the inputs as a numbered list with a date beside each, the decision maker, the
communication rhythm, and the first milestone. A checklist a client can answer in one sitting
beats a meeting they postpone twice.

**Either way, what the client owes is the real start date.** An access list nobody has
worked through is not a formality, it is the reason a project sits idle in week one, so it
goes into `## Client inputs` with owners and dates and is named in the report as what still
blocks the start.

## Step 5: Report

Run `python3 code/client_workspace.py new <id>` once the brief exists. A job folder is a sales
artefact and stops mattering the day the contract starts; delivery needs one place per client.
It opens `clients/<slug>/` with `context.md` (who they are, what was sold, what was promised,
what access they owe), the brief copied in, and `inputs/`, `work/` and `delivered/`. Everything
under `clients/` is the member's own and never tracked.

Then fill the lines in `context.md` that read "not recorded yet" from the proposal and the
thread, and name in the report how many are still open. A fact nobody wrote down is a question
the client gets asked twice.

**Then put the new facts about the member back into their own file**, from what the
contract said rather than from a question: the rate or amount they actually sell at, and a
`pending` Results entry for the engagement with the client's industry and the sold outcome.
Say the lines in one block, write them on a yes, and never promote a promise to a result.

**Run again after delivery.** `/won <id>` a second time asks the one question no other
command owns: what came out of it, with a number and where it can be checked, as `verified`
when they can point at it and `pending` otherwise. Without it the evidence base stays at the
day of the interview while the member's work moves on.

Use the completion report from `CLAUDE.md` and link the handover brief. The next action is
to start delivery from it. End with `Upwork calls: N`: two on a first run for the contract
and its milestones, zero on a later one.
