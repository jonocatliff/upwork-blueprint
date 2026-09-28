---
description: Finds the Upwork jobs worth your Connects right now, scores them against your finished profile, and puts the best into your pipeline and cockpit.
argument-hint: "[focus: recommended | tracks | recheck | skip <job id> <reason>]"
---

# /find-jobs

Fresh jobs are useful because the member can decide before spending Connects;
whether applying earlier improves win rate is a practitioner hypothesis, not a
measured rule in this repository. This looks at what was posted since the last
run from two directions: Upwork's recommendations and the member's search
themes. Code counts client, budget and freshness signals; Claude judges fit.
Runs only when the member runs it.

Read first: [references/upwork.md](../../references/upwork.md) for what is allowed and what the connector gives you, [references/jobs.md](../../references/jobs.md) for where the work comes from and what it pays, `context/me.md`.

## Taking a lead off the list

`skip <job id> <reason>` does that one thing and stops. It calls no tool that
talks to Upwork and runs no search, so a lead recognised as a no days after the
run that found it costs nothing. Step 7 asks the same question for the leads of
the current run; this is the same record, written later.

Run `python3 code/pipeline.py get <job id>`. Only a Not applied lead (status
`new`) can be skipped. A lead further along moves through `/brief`, so say that
and stop. Without a reason, ask for one line and wait: a useful reason names the
fact that rules the job out, such as budget, scope, tool or client, never a mood.

Then `python3 code/pipeline.py set <job id> skipped --note "not a fit: <reason>"`.
Keep the prefix. `python3 code/jobs.py rules` counts a reason only when the note
carries it, so a note without it takes the lead off the list and loses the lesson.

Report one line: the job title, the reason as saved, and that the lead left the
cockpit list. End with `Upwork calls: 0`, and do not continue into Step 0.

## Step 0 · Files, connector, window

Run `python3 code/workspace.py` and `python3 code/pipeline.py prune`, then `list_accounts` (walk through connecting as `/profile` Step 0 does if the tools are missing). Then `python3 code/jobs.py window`: the hours to look back, at least 10, stretched to cover the gap since the newest saved lead, capped at 72 hours.

## Step 0b · Is this the first run, or a run with a direction?

Look at `context/me.md` under "Job search tracks" and at `data/jobs.json`. **No tracks
yet, or no application in the pipeline, means the first run**, and the first run has a
different job: it does not hunt the best five, it finds out which searches are alive in
this member's direction. Say which mode is running in one line.

**The first run explores.** Build ten to twelve candidate terms across all four branches
below, from `context/me.md`: the tools the member can work with, the roles clients hire
for, the problem words, and the industries they have actually worked in. When the
direction is still open, cover two candidate lanes rather than one. Then one call per
term, `limit` 10, `sort` `recency`, and **no window filter**, because the point is
density, not freshness. Measure them with Step 3a, and report per term what it costs in
Connects, what the postings pay against the bands in
[references/jobs.md](../../references/jobs.md), and how many ask for
entry level.

Close the first run by writing the three to five terms that survived under "Job search
tracks" in `context/me.md`, each with its verdict and the date, and by naming the lane
the evidence points at. That is the direction, decided by measurement rather than taste,
and `/profile` will lead with it.

**Every later run exploits.** It runs the kept tracks, pages the dense ones, applies the
lessons from Step 3b, honours the window from Step 0, and tests at most one new candidate
term per run so a bad guess costs one call. A term that returned nothing twice gets
removed from `context/me.md` with a line saying so.

## Step 1 · Invitations first

Call `list_freelancer_proposals` action `invitations` once. A client who invited
the member is the warmest lead there is, so every open invitation goes to the
top of the report. For each one not yet in the pipeline, fetch the job with
`find_jobs` action `get` and add it with `python3 code/pipeline.py add --file -`
(id, title, url, budget, job_type, client and posted_date from that response,
`found_via` set to `invitation`), then store its details as Step 6 does. The
member answers the invitation on Upwork; this command never accepts or declines
it. No invitations: say nothing and continue.

## Step 2 · Search, two directions

Save each response's `jobs` list to `data/search/<name>.json` as `{"jobs": [...]}`, every job with its fields as returned. The file name becomes the job's "found via", which is how weak tracks get noticed later.

1. **Upwork's recommendations:** when the connector exposes it, use the
   documented but untested `find_jobs` action `smart_search`, `mode`
   `most_recent`, `days_posted` the window in days rounded up and
   `verified_payment_only` true. The tool description calls this Upwork's
   profile recommendations and gives it a real date filter. Page the way `search` does, with
   `cursor` set to the previous response's `pageInfo.endCursor` while
   `pageInfo.hasNextPage` is true, at most 4 pages. Save as
   `recommended-1.json`, `recommended-2.json` and so on. If the action or
   documented response shape is absent, report that evidence gap and continue
   with search themes rather than guessing.
2. **Your search themes:** run `python3 code/jobs.py rules`. Its `themes`
   are the member's personal configuration from `context/me.md`. Each theme
   groups useful variations and tool names into one semantic query. For every
   theme, call `find_jobs` action `search`, `query` the emitted `query`, `sort`
   `recency`, and `verified_payment_only` true. Page with `cursor` while
   `hasNextPage` and the page's newest job is still inside the window, at most
   2 pages. Save as `query-<slug>.json`, using the emitted `slug`. Never split
   the terms into separate calls: the grouped query exists to cover variants
   without wasting calls.

   If there are no themes yet, propose three to six from the member's services,
   profile skills and proof. Use `- Theme: term · variant · tool` lines, each starting with the dash because `jobs.py rules` reads no other line, write
   them under "Job search tracks" in `context/me.md`, and say so in one line.
   Do not add a service merely because a tool exists; the member must actually
   want that work.

   **Cover all three branches, not just one** (see
   [references/jobs.md](../../references/jobs.md)):
   the tools a client runs, the job titles a client hires for, and the problem
   words a client uses when they do not know the solution. Most freelancers
   search only the third and land in the crowd.

3. **The client's own industry.** Search the trade plus the pain, not the tool: a dental
   practice, a gym, a law firm, an HVAC company, a Shopify store or a clinic writes about
   itself and its no-shows, its leads or its follow-up. An industry the member has actually
   worked in belongs in this list first, because they speak that language and the
   competition does not. Save as `industry-<slug>.json`.

4. **The client's own tools, which is the quiet half.** Search the platforms the
   member can work with even when the posting will never say "automation":
   Shopify, Salesforce, Monday, ClickUp, Zoho, Pipedrive, Google Calendar, Gmail,
   Zoom. A client who wants their Shopify customers in their Google Calendar
   posts about Shopify and Calendar, because they cannot know the answer is one
   Make workflow. Those postings sit in searches almost nobody runs. Propose two
   or three such tracks from the member's own stack, mark them in `context/me.md`
   like any other theme, and save them as `query-<slug>.json` so the funnel shows
   later which branch actually paid.

Default to broad themes and score after retrieval. Do not add a proposal-count
or budget filter unless `context/me.md` records that boundary as a member choice;
filters remove jobs before anyone scores them.

**Never disqualify a client on a thin signal.** No spending history, a low average
hourly spend or few reviews are not a ceiling: a $6 average can be an old assistant
contract, and our own measurement of one day found the cheapest postings coming from
clients with no history and the best-paying one from a client with $20,000 of it,
which settles nothing either way. What does disqualify a posting is its own text
fixing a low budget and a deadline together. Honest reviews are the one signal worth
reading closely.

## Step 3 · Count

Run `python3 code/jobs.py candidates data/search/*.json --window-hours <window>`. It drops what you already applied to, unverified clients and anything outside the window, merges duplicates across searches, skips jobs already in your pipeline, and prints each candidate with its client, budget, competition and points for trust, deal and recency.

## Step 3a · Measure which terms are worth their calls

Run `python3 code/tracks.py measure data/search/*.json`. For each term it reads how many
hours its ten newest postings span, which is the density of that term: a live one returns
ten postings from the last eight hours, a dead one reaches back three weeks for the same
ten. It also reports how many state a rate, the median proposal count and how many clients
are payment verified.

The verdict per term decides the next run rather than this one: dense terms get a call and
a page every run, steady terms one call, thin terms a weekly look instead of a daily one.
Say which terms changed category, and drop a term that returned nothing twice. Testing a
new term costs exactly one call, which is why a candidate list of ten is cheap and a
guessed list of three is not.

## Step 3b · Apply what your own pipeline has taught

Run `python3 code/learn.py report`. It counts what happened to the leads this member
already applied to, by search branch, client country, client spending history, job type,
the level the client asked for and the member's own score band.

Two of its lines work from the first run, because they count decisions rather than
outcomes. **Per search branch** it says how many candidates reached the pipeline; a branch
that keeps producing and never passes one is a keyword list to drop, and that is the
cheapest lesson this pipeline can hand you. **The disagreements** are the leads the score
let through and the member then turned down, with their reasons: the only place the score
is told it was wrong, so weigh one of those above ten counted outcomes.

The outcome lessons do wait for a sample. Below the gate nothing is weighted, which is the
normal state for the first months: a rule built on three applications costs more Connects
than it saves. Past it, `python3 code/learn.py lessons` writes `data/lessons.json`, which is
a list for you to read, not a filter the score applies on its own: no script reads that file.
Use it in Step 4 the way you use the skip reasons, by hand, and name in the run which lesson
you applied and which dimension is still too thin. A lesson is worth at most a few points of
fit either way; a sample of eight cannot carry more than that.

## Step 4 · Judge niche fit

Run `python3 code/jobs.py lessons` first: the member's past decisions, including
every reason saved with a skip. Use relevant reasons to
calibrate fit and explain their effect in the candidate's rationale. A bare
"not a fit" is not evidence of a particular budget, niche or tool preference.
Treat one rejection as specific to that job; repeated reasons can guide ranking,
but never invent a blanket exclusion or silently rewrite `context/me.md`. Only
explicit member boundaries there may remove jobs before scoring. Automated
"cannot apply" skips describe eligibility, not the member's taste.

Also read `performance` from `python3 code/jobs.py rules`. It groups saved leads,
applications, conversations, wins and disqualifications by search theme. Prefer
themes that have produced conversations or wins when choosing which borderline
jobs to open. Repeated disqualifications with the same reason lower fit for the
same pattern. These are downstream outcomes for saved leads, not true search
precision: raw Upwork retrieval totals are deliberately deleted after each run.
Never disable or rewrite a theme without the member's explicit decision.

Then give every candidate a niche fit from 0 to 40 against `context/me.md`:

- **35 to 40:** the center of what you sell, and your proof covers it.
- **25 to 34:** clearly yours, one step off the center.
- **20 to 24:** you could do it, your proof barely covers it.
- **Under 20:** not your work. Never logged, whatever the client or budget.

Signals that raise fit come from `context/me.md`: the member's niche, the
clients they serve best and the services they want more of. Their exact tools
and verified proof raise confidence, but never turn an unrelated job into a fit.
Traps that look like a match and are not: ranking or result guarantees, bought
links or reviews, generic work outside the member's niche, open-ended
account-manager roles, a full-time employee disguised as a contract, and
anything the member ruled out in `context/me.md`.

Write `data/fit.json`: per job id `{"fit": 0-40, "rationale": "<what the score bets on, in one sentence>", "summary": "<what they want built and the one thing that makes this job distinctive, in two or three concrete sentences>", "headline": "<who wants what, one sentence of at most 14 words>", "trap": "<only when one applies>"}`. The cockpit list shows the headline whole, so it names the client and the concrete outcome, never a category label. The rationale never repeats what the card already shows (budget, client rating). The summary must let a member explain the job without reopening the posting; never reduce a multi-part build to a category label.

## Step 5 · Score and log

Run `python3 code/jobs.py score`. It adds the four parts, logs every job with fit at least 20 and score at least 50 into your pipeline, caps any job you named a trap at 60 so a generous client cannot lift a disguised full-time or operator role above a real build, and prints the ranking as a grade out of 10 with the points behind it. Everything it turns down is written to `data/decisions.jsonl` with the points and the reason, which costs the member nothing and is what the next run learns from. Report grades to the member, never the raw points: the hundred exists for ranking and for the lessons, the grade is what a person decides on.

## Step 6 · Open the best five

For the five highest new jobs, one at a time: `find_jobs` action `get` with the job id. Save to `data/details/<id>.json` these parts of the response, as returned: `connects_cost`, `can_apply`, `activityStat`, `preferred_qualifications`, `client_record`, `contractTerms`, `clientCompanyPublic` and the full `description`. The last two carry the experience level, engagement type, client city and timezone that `jobs.py detail` reads.

After reading that full description, add a `brief` object to the same file:

```json
{
  "outcome": "Two or three concrete sentences: what should exist when the work is done and who uses it.",
  "scope": ["Three to six specific deliverables or workstreams."],
  "requirements": ["Only explicit must-have experience, constraints or application instructions."]
}
```

Use the client's facts, not guesses. Do not mix fit, competition or sales advice into this brief; those have their own places in the cockpit. Then `python3 code/jobs.py detail <id> data/details/<id>.json`. It stores the brief, Connects price, competition, hiring progress and full posting. Only a new job with `can_apply` false is skipped automatically. Hiring progress and unmet preferred Job Success or earnings are advisory: a job may hire several people, and a preference is not an eligibility block. Never fetch details for a whole list: that is the request pattern Upwork flags as scraping.

Now judge that job's fit again from the full posting, including every mandatory
requirement. Replace its entry in `data/fit.json`, then run
`python3 code/jobs.py reassess <id>`. This replaces the snippet-based score and
closes the lead when the full posting falls below the same fit or score gate.
Never let the snippet score survive as the final assessment for an opened job.

Write the outcome in plain language: who uses the finished work, what happens
for them, and what changes. Expand shorthand such as "membership automation"
into the actual behavior from the posting. A member should be able to explain
the job aloud after reading it once. Specificity matters more than brevity.

**Name the client's industry first, in the headline and in the first sentence of
the outcome.** "A business wants its GoHighLevel CRM cleaned up and automated"
describes half the board and tells the member nothing he can decide on; "A dental
practice wants its GoHighLevel CRM cleaned up and automated" tells him in three
words whether this is his ground. Industry decides fit faster than any other fact:
it says whether the proof file already covers it, whether the vocabulary is
familiar, and whether the pitch can open with a result instead of a promise.

Take the industry from the posting: the client's own words, the company profile,
the examples they name. Never infer it from the tool they use: GoHighLevel is sold
to every trade there is. When the posting genuinely does not say, write "industry
not stated" rather than a guess, and never a plausible-sounding one. That blank is
itself worth seeing: a client who does not say what business he is in is usually
also vague about what he wants.
The list uses this outcome, or the saved `summary` when no full brief exists.
Keep both focused on the requested work. Put proof fit, competition and advice
in `rationale`, not in the job description. The sidebar shows that assessment.
To clarify an existing member-written summary, use
`python3 code/pipeline.py describe <id> "Plain-language summary"`, and for the
list's one-sentence headline `python3 code/pipeline.py headline <id> "<sentence>"`.

## Step 7 · Close

1. `python3 code/pipeline.py prune`, then `python3 code/jobs.py clean` (deletes this run's raw responses).
2. Ask once, in one line, which of the leads you showed are a no and why. Take the
   answer in any shape, including none, and record each with
   `python3 code/pipeline.py set <id> skipped --note "not a fit: <reason>"`. Keep the
   prefix, because `python3 code/jobs.py rules` counts a reason only when the note
   carries it. A reason names the fact that rules it out, such as budget, scope, tool
   or client. This is the half of the record that needs a person, so it is asked once,
   here, and never chased. A lead the member rejects later takes the same route through
   `/find-jobs skip <id> <reason>`.
3. Keep the complete scored list in the cockpit. The chat report names open
   invitations first, then the count scoring 70 or more and, if useful, the best
   lead with one reason. No separate
   result list or repeated recap. None above a 7: say so plainly.
4. Use the compact completion report from `CLAUDE.md`. Next step: open the cockpit,
   or `/pitch-page <id>` for the best lead. End with `Upwork calls: N`, measured,
   never an estimated range.
