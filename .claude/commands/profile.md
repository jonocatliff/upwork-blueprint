---
description: Writes your optimal Upwork profile, ready to paste, from your facts and your audit. Every number in it is backed by your proof file.
argument-hint: "[focus: title | overview | skills | portfolio | video | fields]"
---

# /profile

Follow `references/copy.md`. The member described in
`context/me.md` is the person this profile sells; never import a personal voice
or identity from outside this repository.

The fixes the audit found, written out. This
command always hands over finished text and the exact place to paste it.

Read first: [references/upwork-method.md](../../references/upwork-method.md) for the rules every draft follows, [references/profile-language.md](../../references/profile-language.md) for how sixteen real profiles are written and what none of them does, [references/upwork-beginner.md](../../references/upwork-beginner.md) when there is no Upwork history yet, [references/profile-blueprint.md](../../references/profile-blueprint.md) for every field, its principle and what finishes it, [references/upwork-visibility.md](../../references/upwork-visibility.md) for the filters a client can close, and [references/profile-formula.md](../../references/profile-formula.md) for why they win. Then everything that exists of `audit-report.md`, `data/profile.json`, `context/me.md` and `context/proof.md`.

**Focus:** $ARGUMENTS. Given a focus, write only that section of `profile.md` and leave the rest as it is.

**No audit yet?** Run it first; this command needs its findings. A from-scratch
audit report with no profile text to score is enough: continue with the member's
facts and proof, rather than sending them back to `/audit`. No Upwork profile at
all is the normal starting point, not an error.

## Step 1 · Read your facts

`context/me.md` and `context/proof.md` hold the background, the offer, the terms
and every result the member can back up. `/context` writes them; this command
writes copy and interviews nobody.

Run `python3 code/context_check.py`. Open questions never stop this command:
write the draft from what exists and name every gap under "# Decide first" at the
top of `profile.md`. Only when both files are still untouched starters does
`/context` come first, because then there is nothing to write from.

**Never use a pending claim in client-facing copy.** Verified means the member
said where it can be checked, or an Upwork aggregate carries it. With no verified
result at all, the draft leads with the offer and the background instead of a
number, which is the normal case for a first profile.

Read `audit-report.md` and `data/profile.json` when they exist. A result the
member already claimed in their own profile is a question, not evidence. Do not
promote it to verified proof merely because it was already public.

## Step 2 · Write profile.md

Write in the member's own voice, taken from how they write today and how they answer, minus everything the formula bans. Plain words, no em-dashes.

The craft is in [references/copy.md](../../references/copy.md): rhythm, the two
perspective flips, how a section opens, which objection to answer, and the close.
Follow it here rather than restating it.

First three lines, then the decisions:

```
# Your Upwork profile

Written Saturday 12 September 2026 · clears every draft check · every number backed by your proof file
**Next:** answer the open questions below, then paste the sections in the order at the bottom.
```

Then these sections, with these exact headings. The gate reads the first four (`## Title`, `## Overview`, `## Skills`, `## Portfolio titles`); the last two are for you alone:

- **`## Title`**: the recommended title alone in a fenced `text` block, three or four blocks split by |, each block a word a client types. Upwork documents no character limit; the sixteen measured profiles run 55 to 70, so stay inside that and never pad to fill it. Below it, four to seven variants as a list, each with its angle in bold (tool first, outcome first, niche first, audience first). Picking is faster than explaining.
- **`## Overview`**: the first two lines once on their own as a quote, because they carry the click. Then the whole overview in one fenced `text` block. No markdown inside it: Upwork shows asterisks as asterisks, so structure comes from Unicode bold, emoji or plain prose. Offer prose first when the member writes well, because the two highest earners in the measured sample use it and lists sat with the lower ones. It opens with what the client gets and the strongest relevant verified proof when one exists, lists what you build, names the tools on one line for search, and ends with a specific ask. A good ask invites the client to send their website on Upwork.
- **`## Skills`**: one `- Skill` line each, up to 20, in Upwork's exact spelling (the skill for GoHighLevel is called HighLevel). Use names seen in real profiles or job posts; mark any you could not confirm with "(check the spelling in Upwork's list)".
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
  the number, not a feeling.
- **`## Paste order`**: where each section goes on Upwork, click by click.

## Step 3 · The gate

Run `python3 code/profile_draft.py check profile.md`. It re-runs the audit's checks on the draft, Upwork's limits, and looks up every number in your proof file. Exit 1 means fix and run it again. Never loosen the draft's claims to pass, and never add a number to the proof file to make the gate quiet: the proof file changes only with the member's word or the connector's.

## Step 4 · Put it live, one field at a time

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
differs from the documented preview flow, stop and keep the manual handoff. Then
run `/audit` again: the score comes from the live profile, not from the draft.

## Step 5 · Report

Run `python3 code/pipeline.py prune` first, then the completion report as CLAUDE.md defines it. Link [profile.md](../../profile.md). Next step: paste, then `/audit` again, which should now clear almost every check; what still fails comes back here. End with `Upwork calls: N`.
