# Follow-up rules

What: a context-based sequence for dormant leads and previous clients.
Measured: 12 September 2026 against the first imported conversation.
Next: run `/brief` without a job id each morning; it runs this sequence first.

The point is to make the next decision easy, not to maximize message count.
Every interval below is a ceiling. Conversation context can shorten a sequence
or stop it, but never extend its maximum.

## Reply now

When `awaiting_reply_from` is `you`, answer today. This is a reply, not a dormant
lead follow-up, and it does not consume a sequence step. A client question,
requested change, call request or offer always outranks scheduled follow-ups.

## Hot lead

Use `hot` when the client asked about a call, price, proposal, start date or
decision, or when an offer is close but one concrete item blocks it.

Allow up to three follow-ups. After a sent message, wait 1, then 3, then 7
business days. The first should close the named decision. The second should
reduce scope or answer a likely blocker. The third should close the loop without
guilt or fake urgency.

## Warm lead

Use `warm` after at least two substantive client turns, a reviewed deliverable or
a specific next step without an immediate buying signal.

Allow up to three follow-ups. Wait 2, then 5, then 10 business days. Use the
conversation's open loop. Add a useful observation or make the next choice
smaller. A generic status request does not count as value.

## Light lead

Use `light` after one short client response or weak engagement with no specific
next step.

Allow two follow-ups. Wait 3, then 7 business days. The second is the close. Park
the lead after that unless the client returns.

## Previous client

Use `reactivation` only for a `won` client with a positive relationship and a
real reason to reconnect. An unfinished promise or stated date overrides this
lane and becomes a normal task.

Allow two messages, 30 then 60 business days apart. Lead with a relevant idea,
change or next project based on the completed work. Do not send a vague
"hope you're well" sequence.

## Applied, lost, skipped and new

An `applied` proposal has no room until the client writes, so it has no follow-up
and creates no task. Sync moves it to `lost` after 14 full days without a client
reply. No draft and no reminder mean the system is working correctly.

Do not follow up with `new` or `skipped` jobs. A `lost` lead gets one future
check only when the client explicitly named timing or budget as the reason and a
date makes sense. Otherwise it stays closed.

## Context beats the lane

Stop immediately after an explicit no, a request for no more contact, evidence
that another freelancer was hired, or a move to another agreed communication
channel. Do not duplicate the conversation across channels.

Honor a date the client named. Follow up on the next business day after a missed
promise, not according to the generic lane.

Count meaningful client turns, not message bubbles. Three short bubbles sent in
one minute are one turn. Multiple unanswered member messages reduce the next
sequence, never increase it.

## What each message earns

Step one reopens the exact decision. Step two adds a new reason to answer. The
last step gives a clean close. Every message should be understandable without
reading a sales template, grounded in the thread and written as the member.

The first measured thread supports the timing principle, not a universal
conversion claim: a useful delivery follow-up and one later reminder produced a
client reply two days later. The bare "just checking in" message added no value,
so this system excludes that pattern.

## Workflow

Turn the current pipeline and fresh conversations into today's follow-up queue.
The member starts every run. The run makes decisions and drafts, but sends
nothing.

### Start with current evidence

Read `data/sync.json` and run
`python3 code/pipeline.py summary`.

If today's sync is missing or any relevant thread is older than 24 hours, follow
`.claude/commands/brief.md` Step 1 once before reviewing. Call the connector as
`references/upwork.md` describes. Never poll or read every historical room.

Review jobs in `replied`, `offer` and `won`. An `applied` proposal without a room
cannot receive a message, so leave it waiting without a task, reminder or draft.

### Decide from the conversation

For each job, read the pipeline record and the full saved thread oldest first.
Use the status, `awaiting_reply_from`, last meaningful message, explicit dates,
client engagement and consecutive messages from the member. Apply the lane,
cadence and stop conditions above.

Maximum steps are ceilings. Choose fewer when the thread is weak, the ask is
already stale, the client moved the conversation elsewhere or another message
would add no reason to answer.

For each active sequence, write the decision only through:

`python3 code/pipeline.py follow-up <id> plan --lane <lane> --due <date> --reason "<conversation-based reason>"`

Clear a sequence when a stop condition applies:

`python3 code/pipeline.py follow-up <id> clear --reason "<why>"`

### Draft only what is due

For every sendable lead due today or earlier, follow `references/copy.md` and
Step 4 of `.claude/commands/brief.md`. Save two drafts to
`jobs/<id>/replies.json` and run `python3 code/replies.py check <id>`.

Each follow-up adds one new reason to answer: a useful observation, a narrowed
decision, a relevant next step or a graceful close. A pure "just checking in"
message is not a draft.

Report this in chat, in three short groups: due today, coming up, parked. Put
the decision and reason before supporting detail, name each due job by its
title, and keep it to active or recently parked items. Nothing is written to a
file: `data/jobs.json` already holds every plan, due date and reason, and the
cockpit renders the same three groups from it.

### Report

Use the repository's completion report. Lead with the number due now and name
the strongest opportunity. The member sends the draft on Upwork and says so in Claude Code; then run
`python3 code/pipeline.py follow-up <job id> sent`. The sequence advances only
after that confirmation. End
with the exact Upwork call count.

### Self-improvement

When the member corrects a cadence decision or a follow-up wins a reply, ask
whether to keep the lesson. If yes, record it against that job with
`python3 code/pipeline.py note <job id> "<the dated observation>"`, where the
next run will find it. Change the intervals in this file only after two
independent examples support the same default.
