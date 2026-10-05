---
description: Measures your live Upwork profile, then writes the version that fixes it, ready to paste. Every number in it is backed by your own evidence.
argument-hint: "[title | overview | skills | portfolio | video | fields]"
---

# /profile

Follow `references/copy.md`. The member described in
`context/me.md` is the person this profile sells; never import a personal voice
or identity from outside this repository.

This command does both halves of the job: it measures what is live today, then
writes the version that fixes what it found. It never stops at the measurement:
a report about a profile helps nobody, the written profile is the deliverable.

Read first: [references/profile.md](../../references/profile.md), which holds every field, what finishes it, the filters a client can close, how strong profiles are written and what has to be on the table before you start; and the profile sections of [references/upwork.md](../../references/upwork.md) for what the connector may write. Then `context/me.md` and `data/profile.json`.

**Focus:** $ARGUMENTS. A focus writes only that section of `profile.md` and
leaves the rest as it is. Every run writes something.

## Step 0 · The connector, and what is live right now

1. Run `python3 code/workspace.py`.
2. Call `list_accounts`. **If the Upwork tools are not there**, walk the member through it and stop:
   Follow [README.md: Connect Upwork](../../README.md#connect-upwork), then run `/profile` again.
3. Take the `org_uid` of the Freelancer account. Never write it into a file. More than one freelancer account: ask which.
4. **Read the live profile, not the draft.** `get_profile` action `get` saved
   exactly as returned to `data/profile.json`, and `get_profile` action
   `list_highlights` to `data/highlights.json`. Skip both calls only when those
   files exist and are under 24 hours old, which is the case right after
   `/context` read them.

   This is the step that keeps the command honest. Measuring a draft this
   command wrote proves nothing: every claim in it would pass because it put it
   there. The score always comes from what Upwork serves today.

**No title and no overview?** This member starts from scratch. Say so in one
line, skip Steps 1 and 2 entirely, and write the profile from their facts and
proof. Never invent a score or infer experience from an empty profile. No Upwork
profile at all is the normal starting point, not an error.

## Step 1 · Measure what a script can

Run `python3 code/profile_checks.py data/profile.json data/highlights.json --json`.

The script decides pass or fail for the mechanical checks. Never overrule it. If a result looks wrong to you, say so in chat and leave the finding as the script scored it.

**Completeness, because it is the one lever Upwork admits to.** From the saved
profile response, work through the published percentages in
`references/profile.md`: the mandatory half (photo, overview, one
employment entry, one skill tag) and then each optional field with what it is
worth. Note every missing field **with its percentage**, cheapest first, because
"add a linked account" is ten points for one click and "record a video" is ten
for an afternoon. This is also the only place a ranking claim is allowed, and
only in Upwork's own words: a complete profile ranks better. Nothing else about
ranking gets asserted.

**The filters a client can close.** Every field in
`references/profile.md` that a client can filter on is a gate, and an
empty one fails silently rather than looking untidy: **English level**,
**languages**, **timezone and location**, **availability in hours**,
**categories**, and an **hourly rate**. A wrong timezone also makes every reply
look late.

**The skills clients actually type.** One `find_jobs` action `search` with
`title` set to the member's main tool or role, `sort` `recency`, `limit` 10.
Count the `skills` arrays of the results: those names are Upwork's own spelling
and the client's vocabulary. Note the skills clients ask for that the profile
does not carry, and any skill the profile carries that appeared in none of the
postings. An empty skill slot is reach given away; a wrong spelling is a filter
the member fails without knowing.

## Step 2 · Judge what no script can

Each of these matters only when it fails:

1. **Consistency, first.** Do title, overview, skills and portfolio tell one story? When the title promises A and the portfolio shows B, the client believes neither. This often explains a profile with decent parts and no invitations.
2. **Proof order.** Is the strongest proof the member has, by the tiers in the formula, inside the first 250 characters that Upwork shows in search results?
3. **Opening.** Does the first line say what the client gets, or is it a CV?
4. **A claim the aggregate contradicts.** Compare every claim in the text against `data/profile.json`: a badge or a client count the connector's own numbers deny is the most expensive thing that can be wrong, because a client checks it in two seconds.
5. **What nobody in the lane does.** From `references/profile.md`: no price, no "this is not for you if", no availability window, no date on a claim. Name one the member could add truthfully, because it is free and it is a differentiator in the same search.

**Job Success Score and intro video** come from `context/me.md`, collected once
by `/context`. The connector returns neither, measured 12 September 2026.
An unanswered field is not measured, never estimated; name the gap without asking again.

## Step 3 · Read your facts

`context/me.md` holds the background, the offer, the terms
and every result the member can back up. `/context` writes them; this command
writes copy and interviews nobody.

Run `python3 code/context_check.py`. Open questions never stop this command:
write the draft from what exists and name every gap under "# Decide first" at the
top of `profile.md`. Only when that file is still the untouched starter does
`/context` come first, because then there is nothing to write from.

**Never use a pending claim in client-facing copy.** Verified means the member
said where it can be checked, or an Upwork aggregate carries it. With no verified
result at all, the draft leads with the offer and the background instead of a
number, which is the normal case for a first profile.

A result the member already claimed in their own profile is a question, not
evidence. Do not promote it to verified proof merely because it was already
public.

## Step 4 · Write profile.md

For a member in SEO, Google Ads, WordPress or GoHighLevel, read the matching file in `templates/profile/` first: orientation and measured vocabulary, never text to paste.
Every finding from Steps 1 and 2 is fixed here rather than listed. A finding this
command cannot fix itself, because it needs the member's hands on Upwork, becomes
a line in `## Profile fields` or `## Completeness` with what it costs. Nothing
from the measurement is copied into the file as a finding: the file is what gets
pasted, and a checklist pasted into a client-facing overview is a bug.

Write in the member's own voice, taken from how they write today and how they answer, minus everything the formula bans. Plain words, no em-dashes.

The craft is in [references/copy.md](../../references/copy.md): rhythm, the two
perspective flips, how a section opens, which objection to answer, and the close.
Follow it here rather than restating it.

First three lines, then the decisions:

```
# Your Upwork profile

Written Saturday 12 September 2026 · clears every draft check · every number backed by your own evidence
**Next:** answer the open questions below, then paste the sections in the order at the bottom.
```

Then these sections, with these exact headings. The gate reads the first four (`## Title`, `## Overview`, `## Skills`, `## Portfolio titles`); the last two are for you alone:

- **`## Title`**: the recommended title alone in a fenced `text` block, two to five blocks split by |, each block a word a client types. **The limit is 70 characters**, measured from the connector's own write action and from a real title that came back cut at exactly 70, and the draft gate fails anything longer. Strong profiles run 55 to 70, so use the room without padding to fill it. Below it, four to seven variants as a list, each with its angle in bold (tool first, outcome first, niche first, audience first). Picking is faster than explaining.
- **`## Overview`**: the first two lines once on their own as a quote, because they carry the click. Then the whole overview in one fenced `text` block. No markdown inside it: Upwork shows asterisks as asterisks, so structure comes from Unicode bold, emoji or plain prose. Offer prose first when the member writes well, because the two highest earners in the measured sample use it and lists sat with the lower ones. It opens with what the client gets and the strongest relevant verified proof when one exists, lists what you build, names the tools on one line for search, and ends with a specific ask. A good ask invites the client to send their website on Upwork.
- **`## Skills`**: one `- Skill` line each, in Upwork's exact spelling. Upwork's own help says 15 in one place and 20 in another, so fill what the live editor actually offers and claim no number from memory (the skill for GoHighLevel is called HighLevel). Use the names Step 1 counted in real postings; mark any you could not confirm with "(check the spelling in Upwork's list)".
- **`## Portfolio titles`**: one `- New title (was: old title)` line per project. A number goes in a title only when the proof ties it to that project.
- **`## Video script`**: the profile video, where the member introduces themselves. It is
  **derived from the sections above, never invented next to them**: the problem sentence
  is the overview's opening said out loud, the proof beat is the same strongest verified
  item the overview leads with, the process beat matches the services, and the ask is the
  overview's ask word for word. Change the title or the direction later and this script
  changes with it, otherwise the profile and the video sell two different people.
  Spoken language, written to be read aloud, with a time per beat so they can hold it:
  **the client's problem in one sentence** (8 seconds, and never a greeting or a name
  first, because a client who wanted a CV would read one), **what the member does about
  it** (15 seconds), **up to three verified proofs, or the background instead when there
  are none** (20 seconds), **how working together runs, in two or three steps** (20
  seconds), **the ask, the same imperative plus permission the overview closes on** (10
  seconds). That lands near 75 seconds; Upwork documents no length limit and 30 to 90
  seconds is practice.

  **The format, because it has to be readable while recording.** One block per beat, in
  this shape, and nothing else between them:

  ```
  ### 0:00 to 0:08 · The problem
  The spoken words, exactly as they are to be said, one sentence per line.
  **On screen:** one short direction.
  ```

  Speaking pace runs near 150 words a minute, so the whole script lands between 150 and
  190 words. Write contractions, the way people talk. One sentence per line so the eye
  finds its place after looking at the camera. No greeting, no name in the first
  sentence, no jargon a client would not use out loud, and no sentence longer than 14
  words. The last beat repeats the overview's ask word for word, so the profile and the
  video make the same promise.

  Close the section with two lines: the total word count with the estimated seconds, and
  "read it aloud once before recording; anything that trips your tongue gets cut". It is
  a YouTube link with monetisation off, worth 10% of completeness, and a profile goes
  live without it while a profile waiting for it never does.
- **`## Profile fields`**: the rest of the profile, written out and ready to paste,
  because completeness is the only ranking lever Upwork admits to and these fields
  carry half of it. One short block each, from `context/me.md` and nothing invented:
  **Employment history** (every relevant role with employer, title, period, and one line
  on what that employer's customer got, including work outside freelancing),
  **Education**, **Languages with the English level**, **Availability** in hours per
  week, **Categories** matching the direction rather than the old job, **Hourly rate**
  as the band and the number to enter, **Photo** as one instruction (a face, no logo,
  no group shot), **Linked account** naming which one, and **Other experiences** for
  volunteer work, a side project or a system built at a non-freelance job. A field the
  member has no answer for gets one line saying what is missing and what it costs.
- **`## Completeness`**: where the profile stands against the published percentages in
  the blueprint and the shortest route to 100, listed as the actual next clicks. State
  the number from Step 1, not a feeling.
- **`## Paste order`**: where each section goes on Upwork, click by click.

## Step 5 · The gate

Run `python3 code/profile_draft.py check profile.md`. It re-runs the same checks on the draft, Upwork's limits, and looks up every number in the evidence sections of `context/me.md`. Exit 1 means fix and run it again. Never loosen the draft's claims to pass, and never add a number there to make the gate quiet: those sections change only with the member's word or the connector's.

## Step 6 · Put it live, one field at a time

The connector's 12 September tool description documents `update_profile`
previews for the title (`update_title`), overview (`update_overview`), full skill
set (`set_skills`, whose real cap is read in the live editor rather than remembered), availability, employment,
education and languages; the title, overview and skills writes remain untested.
Use a write only when that action is present and it returns the documented
preview. Otherwise hand over the paste-ready version and
click path. Hourly rate, portfolio and video stay manual.

For each writable field, create the preview and show exactly what would replace
what. Call `confirm_preview` only after an explicit yes for that field. One
field, one yes; "approve all" is not a yes for each. If the returned behavior
differs from the documented preview flow, stop and keep the manual handoff.

## Step 7 · Report

Run `python3 code/pipeline.py prune` first, then the completion report as
CLAUDE.md defines it. Say the score from Step 1 and what changed because of it,
worst problem first, in three lines at most. Link [profile.md](../../profile.md).

Next step: paste it on Upwork, in the order Step 6 gives, then `/find-jobs`,
which scores postings against the profile you just put live. Run this command
again once something real changes, a delivered result or a new direction, not on
a schedule. End with `Upwork calls: N`, measured,
never estimated. Reading costs four on a first run: the account, the profile, its
highlights and the one job search that measures the skills clients type, and
fewer when `/context` already read the profile within the day. Every field put
live in Step 6 adds two more, a preview and its confirmation.
