---
description: Writes your Upwork profile from your own facts and three role models, checks it, and puts it live one field at a time. Every number in it is backed by your own evidence.
argument-hint: "[title | overview | skills | portfolio | video | fields]"
---

# /profile

Follow `references/copy.md`. The member described in
`context/me.md` is the person this profile sells; never import a personal voice
or identity from outside this repository.

Most members start with no live profile, so the main line writes one from their
facts. A live profile adds one review block (Step 2). The written profile is the
deliverable, never a report about an old one.

Read first: [references/profile.md](../../references/profile.md), which holds every field, what finishes it, the filters a client can close, how strong profiles are written and what has to be on the table before you start; and the profile sections of [references/upwork.md](../../references/upwork.md) for what the connector may write. Then `context/me.md`.

**Focus:** $ARGUMENTS. A focus writes only that section of `profile.md` and
leaves the rest as it is. Every run writes something. **`video`** is the script
generator for the intro video: Steps 0 and 1 only, then the script from `context/me.md`
and an existing `profile.md`, with no live read and no role models.

## Step 0 · The connector

1. Run `python3 code/workspace.py`.
2. Call `list_accounts`. **If the Upwork tools are not there**, walk the member through
   connecting as CLAUDE.md says and stop; they run `/profile` again after the restart.
3. Take the `org_uid` of the Freelancer account. Never write it into a file. More than one freelancer account: ask which.

## Step 1 · Read your facts

`context/me.md` holds the background, the offer, the terms and every result the
member can back up. `/context` writes them; this command writes copy and interviews
nobody. **The direction it recorded** (lead branch, offer, audience, country) is what
everything below is built from.

Run `python3 code/context_check.py`. Open questions never stop this command: write
the draft from what exists and name every gap under "# Decide first" at the top of
`profile.md`. Only when that file is still the untouched starter does `/context` come
first, because then there is nothing to write from.

**Never use a pending claim in client-facing copy.** Verified means the member said
where it can be checked, or an Upwork aggregate carries it. With no verified result at
all, the draft leads with the offer and the background instead of a number, which is
the normal case for a first profile. A result the member already claimed in their own
profile is a question, not evidence, even though it was already public.

## Step 2 · What is live, if anything

Call `get_profile` action `get` and save it exactly as returned to `data/profile.json`,
then `list_highlights` to `data/highlights.json`; skip both when those files are under
24 hours old. The score always comes from what Upwork serves today, never from a draft
this command wrote.

**No title and no overview?** The normal start. Say so in one line, skip the rest of
this step and let Step 5 list what has to be created. Never invent a score or infer
experience from an empty profile.

**With a live profile**, measure and judge it:
- Run `python3 code/profile_checks.py data/profile.json data/highlights.json --json`.
  The script decides pass or fail for the mechanical checks; never overrule it, say so
  in chat when a result looks wrong.
- **Completeness**, the one lever Upwork admits to: work through the published
  percentages in `references/profile.md` and note every missing field **with its
  percentage**, cheapest first. Only here is a ranking claim allowed, in Upwork's own
  words: a complete profile ranks better.
- **The filters a client can close** (`references/profile.md`): English level,
  languages, timezone and location, availability in hours, categories, hourly rate. An
  empty one fails silently, and a wrong timezone makes every reply look late.
- **Judge what no script can:** do title, overview, skills and portfolio tell one story;
  is the result a client cares about most inside the first 250 characters; does a claim
  contradict the aggregate in `data/profile.json` (a badge or client count Upwork's own
  numbers deny is the most expensive error); what could the member add that nobody in
  the lane does, such as a price or a "this is not for you if".

**Job Success Score and intro video** come from `context/me.md`. The connector returns
neither, measured 12 September 2026. An unanswered field is not measured, never estimated.

## Step 3 · Skills and role models

**The skills clients type.** One `find_jobs` action `search` with `title` set to the
direction's main tool or role, `sort` `recency`, `limit` 10. Count the `skills` arrays:
those names are Upwork's own spelling and the client's vocabulary. Note the ones the
profile lacks and any it carries that appeared in no posting.

**Three role models.** The connector cannot search for freelancers (checked 6 October
2026), and a freelancer login or a web search did not surface profiles either. So the
member adds a client profile to the same login (Account Settings, no job is posted) and
searches Upwork's talent search with their country, the Top Rated filter and the
direction's keywords. Among the results favour high earnings, many finished jobs and
recent work. They paste three to five profile addresses (the `~` in them is the key);
if they will not, say so and go on without role models. Read each with `get_profile`
action `get` and its `profile_key`, rank by success, not badge (earnings bucket, then
jobs and reviews), pick the three closest by skills in common and rate band, name the
criteria and say the job success score and hours are not visible. Give four chat lines
per profile: title, how the overview opens, skills and rate band, and the one thing
worth borrowing, with the URL. Take structure and ideas only, never sentences: copied
text gets flagged. Keep no profile text in a file (Upwork content); only the numbers
below.

## Step 4 · Write profile.md

For a member in SEO, Google Ads, WordPress or GoHighLevel, read the matching file in `templates/profile/` first: orientation and measured vocabulary, never text to paste. Title, hook, skills, portfolio titles and video are all built from the recorded direction and say the same thing; when a live profile points elsewhere, write for the recorded direction and say so.

Every finding from Step 2 is fixed here rather than listed. A finding this command
cannot fix itself, because it needs the member's hands on Upwork, becomes a line in
`## Profile fields` or `## Completeness` with what it costs. Nothing from the
measurement is copied into the file as a finding: the file is what gets pasted, and a
checklist pasted into a client-facing overview is a bug.

Write in the member's own voice, taken from how they write today and how they answer.
Plain words, no em-dashes. The writing rules are in
[references/profile.md](../../references/profile.md) and
[references/copy.md](../../references/copy.md).

First three lines, then the decisions:

```
# Your Upwork profile

Written 6 October 2026 · clears every draft check · every number backed by your own evidence
**Next:** answer the open questions below, then put the sections live in Step 6.
```

**Take a position.** In the chat, recommend one title, one hook and one skill order,
each with its reason in two lines from the facts and the role models. When the member
objects, answer it on its merits once: change the draft only for a reason the evidence
supports, otherwise keep it and say so plainly. Never open with "fair point", never
fold under a preference, and never hand back a menu with "which one?". Variants come
only when they ask.

Then these sections, with these exact headings. The gate reads `## Title`, `## Overview`, `## Skills`, `## Portfolio titles` and `## Reference averages`; the rest is for you alone:

- **`## Title`**: the recommended title alone in a fenced `text` block, two to five blocks split by |, each block a word a client types. **The limit is 70 characters**, measured from the connector's own write action and from a real title that came back cut at exactly 70, and the draft gate fails anything longer. Write one title, with its reason in a line.
- **`## Overview`**: the first two lines once on their own as a quote, because they carry the click. Then the whole overview in one fenced `text` block, no markdown inside it: Upwork shows asterisks as asterisks. The shape, in this order: (1) one hook in "you" and "your" on who you are and what the client gets, built from the recorded direction so it fits the title and the services, with a verified number inside the first 250 characters when one exists; (2) three bullets, the results a client cares about most first, each a verified result (BUILT or DELIVERED what, for whom, achieving what, with its number); (3) how you work and one objection answered, plus a differentiator only when it tells the client something Upwork does not already show; (4) search words and spellings the skills list cannot carry, such as "GHL", woven into those sentences, never a separate list; (5) a close as one imperative plus permission back to "you". It reads as one flow, connected sentences with the three bullets as the only list. Never restate what the profile page already shows: location, job and review totals, earnings, badges, the skills list. With fewer than three verified results, use those and ask the member to confirm the rest, never invent one.
- **`## Skills`**: one `- Skill` line each, in Upwork's exact spelling, as many as the live editor offers (the skill for GoHighLevel is called HighLevel). Use the names Step 3 counted in real postings; mark any you could not confirm with "(check the spelling in Upwork's list)".
- **`## Portfolio titles`**: one `- New title (was: old title)` line per project. A number goes in a title only when the proof ties it to that project.
- **`## Reference averages`**: from the role models, `- title: N` and `- overview: N` in characters, the three URLs and today's date. The gate fails a title or overview more than 20 % over these; with no role models there is no ceiling beyond Upwork's limits.
- **`## Video script`**: only the script to read, three parts of about 15 seconds, 45
  seconds in total unless the member names another length. It is **derived from the
  sections above, never invented next to them**: same direction, same results as the
  overview. **Who am I?** (the name, three or four verified facts such as years, projects
  and reviews, and one line on the goal, saving the client time and earning them more
  money), **Why me?** (up to four verified results, each with its number, or the
  background when there are none), **How it works** (four or five steps from the first
  call to the quickest win, closing on "then rinse and repeat" or the member's own close).
  Client first names only when the member gave them.

  **The format, because it has to be readable while recording.** One block per part, in
  this shape, and nothing else, no slide notes:

  ```
  ### 0:00 to 0:15 · Who am I?
  An opener line, then three or four items to read off, one per line.
  ```

  Write it to be said as an enumeration: short parallel items that start with a verb or a
  number, one idea each, no joining sentences, numbers as you would say them, contractions,
  no jargon a client would not use out loud.
  Close with "read it aloud once before recording; anything that trips your tongue gets
  cut". The member records it and gives a public YouTube link, which Step 6 sets; the
  video is worth 10% of completeness, and a profile goes live without it while a profile
  waiting for it never does.
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
- **`## Completeness`**: against the published percentages in `references/profile.md`,
  the shortest route to 100 as the actual next clicks. State the number from Step 2, or
  for a new profile the list of fields to create, cheapest first.
- **`## Paste order`**: where each section goes on Upwork, click by click, for what the
  connector cannot write and for everything if a write fails.

## Step 5 · The gate

Run `python3 code/profile_draft.py check profile.md`. It re-runs the same checks on the draft, Upwork's limits, the length ceiling from `## Reference averages`, and looks up every number in the evidence sections of `context/me.md`. Exit 1 means fix and run it again. Never loosen the draft's claims to pass, and never add a number there to make the gate quiet: those sections change only with the member's word or the connector's.

## Step 6 · Put it live, one field at a time, and report

The connector documents `update_profile` previews (checked 6 October 2026) for the
title, overview, skills (at most 20), the video (`set_video`, the member's public
YouTube link), availability, employment (country as ISO code, role up to 50
characters), education, languages and other experience; none has run from this repo.
When a live title, overview or skills exist, first save them in `profile-before.md` in
the repository root (gitignored, the member's own words) so they can go back. Use a
write only when its action returns the documented preview, otherwise hand over the
paste-ready version and click path. Hourly rate, portfolio, photo, categories and the
linked account stay manual.

For each writable field, create the preview and show what would replace what. Call
`confirm_preview` only after an explicit yes for that field, never one "approve all".
If the behavior differs from the documented preview flow, stop: manual handoff.

## Step 7 · Check what is online, then report

When the member says everything is online, check it. Read `get_profile` action `get`
and `list_highlights` again, fresh and never the saved files, run
`python3 code/profile_checks.py data/profile.json data/highlights.json --json`, and give
the completeness against the published percentages: the number, and every field still
missing with its percentage and its next click (usually photo, portfolio, video, linked
account). What the connector cannot read (photo, categories, linked account, video) is
asked, never assumed.

Then run `python3 code/pipeline.py prune` and give the completion report as CLAUDE.md
defines it: what is live, what stays manual and the completeness number, worst gap
first, in three lines at most. Link [profile.md](../../profile.md). Next step:
`/find-jobs`, which scores postings against the profile. Run this command again once
something real changes, a delivered result or a new direction, not on a schedule. End
with `Upwork calls: N`, measured, never estimated; every field put live adds two, a
preview and its confirmation.
