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
generator for the intro video: Steps 1, 4 and 5 only, then the script from `context/me.md`
and an existing `profile.md`, with no live read and no role models.

## Step 0 · The connector

1. Run `python3 code/workspace.py`.
2. Call `list_accounts`. **If the Upwork tools are not there**, walk the member through
   connecting as CLAUDE.md says and stop; they run `/profile` again after the restart.
3. Take the `org_uid` of the Freelancer account. Never write it into a file. More than one freelancer account: ask which.

## Step 1 · Read your facts

`context/me.md` holds the background, the offer, the terms and every result the
member can back up. `/about-me` writes them; this command writes copy and interviews
nobody. **The direction it recorded** (lead branch, offer, audience, country) is what
everything below is built from. Never reopen it and never suggest another lead branch:
a mismatch between the proof and the direction is one line under "Decide first", not a
question. The only questions here are the role-model addresses, the rate and a yes per
field; claims, education, languages and timezone were settled in `/about-me`.

Run `python3 code/context_check.py`. Open questions never stop this command: write
the draft from what exists and name every gap under "# Decide first" at the top of
`profile.md`. Only when that file is still the untouched starter does `/about-me` come
first, because then there is nothing to write from.

**Use the member's own numbers, and invent none.** A result they stated with a concrete
figure may go into the copy, worded as their own claim, verified or not; the gate checks
every number against `context/me.md`. A claim with no figure, and any number that is not
in the file, stays out. With no usable result at all, the draft leads with the offer and
the background instead of a number, the normal case for a first profile.

## Step 2 · What is live, if anything

Call `get_profile` action `get` and save it exactly as returned to `data/profile.json`,
then `list_highlights` to `data/highlights.json`; skip both when those files are under
24 hours old. The score always comes from what Upwork serves today, never from a draft
this command wrote.

**No profile, or a nearly empty one** (no title and no overview, or just a title or a few
lines)? The normal start. Say so in one line, skip the rest of this step and let Step 5
list what has to be created. Never invent a score or infer experience from it.

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

**Job Success Score and intro video** come from `context/me.md`; the connector returns neither. An unanswered field is never estimated.

## Step 3 · Skills, role models and rate

**The skills clients type.** One `find_jobs` action `search` with `title` set to the
direction's main tool or role, `sort` `recency`, `limit` 10. Count the `skills` arrays:
those names are Upwork's own spelling and the client's vocabulary. Note the ones the
profile lacks and any it carries that appeared in no posting.

**Three role models, before any draft.** Ask for the addresses right after the plan so the member can fetch them while you read the skills; write no draft until they are in or declined, because the role models give the hook, structure, close and lengths. The connector cannot search for freelancers, and a freelancer login or web search surfaced no profiles. So the member adds a client profile to the same login (Account Settings, no job is posted) and uses Upwork's talent search with their country, the Top Rated filter and the direction's keywords, favouring high earnings, many finished jobs and recent work. Tell them to look at title, how the overview opens, skills and rate, and to paste three to five addresses (the `~` is the key) plus two or three newer freelancers from their country with few reviews, because a profile without reviews prices against those. If they decline, go on without role models. Read each one in full with `get_profile` action `get` and its `profile_key` (title, the whole overview, skills, portfolio titles, employment, rate, earnings, jobs), rank the top performers by success (earnings bucket, then jobs and reviews), pick the three closest by shared skills and rate band, name the criteria and say job success score and hours are not visible. Give four chat lines per profile as the summary of that full read: title, how the overview is built from open to close, skills and rate band, and the one thing worth borrowing, with the URL. Take structure and ideas only, never sentences: copied text gets flagged. Keep no profile text in a file (Upwork content); only the numbers below.

**The rate.** After the role models, recommend a range and say it is a recommendation,
built from the hourly ranges and fixed-price medians in the ten postings just read (with
n and today's date), the rates of the newer low-review profiles, the rates in
[references/jobs.md](../../references/jobs.md) and the member's proof in `context/me.md`.
Never base it on the Top Rated role models: they earned their rates, a starter at their
level would price far too high.
No reviews yet: starting near the bottom of the range and raising it with each review is
fine. Where they live decides which clients and hours fit, never a discount. Label what is
measured and what is a guess, then ask what they would actually quote: a number they
cannot defend on a call is worth nothing. After their yes write it into the
`**Hourly rate:**` line of `context/me.md` as a number (a range is fine, the figure they
quote first comes first), because `/pitch-page` prices every bid from it and stops
without one, and `data/profile.json` is deleted after a day. Never ask for a smallest
project: a beginner has no basis for one.

## Step 4 · Write profile.md

Start from the role models: borrow how their titles are built, how their overviews open and
close and what they put in the first lines, as structure and never as sentences.

For a member in SEO, Google Ads, WordPress or GoHighLevel, read the matching file in `templates/profile/` first: orientation and measured vocabulary, never text to paste. Title, hook, skills, portfolio titles and video are all built from the recorded direction and say the same thing; when a live profile points elsewhere, write for the recorded direction and say so.

Fix every Step 2 finding here rather than list it. A finding needing the member's hands on Upwork becomes a line in `## Profile fields` or `## Completeness` with its cost. Never copy a finding into the file: it is what gets pasted, and a checklist in a client-facing overview is a bug.

Write in the member's own voice, from how they write and answer, per [references/profile.md](../../references/profile.md) and [references/copy.md](../../references/copy.md) (plain words, no em-dashes).

First three lines, then the decisions:

```
# Your Upwork profile

Written <today's date> · every number backed by your own evidence
**Next:** answer the open questions below, then put the sections live in Step 6.
```

**Take a position.** In chat, recommend one title, one hook and one skill order, each with a two-line reason from the facts and role models. When the member objects, answer on the merits once: change the draft only for a reason the evidence supports, otherwise keep it and say so. Never open with "fair point", fold under a preference or hand back a menu with "which one?". Variants only when asked.

Then these sections, with these exact headings. The gate reads `## Title`, `## Overview`, `## Skills`, `## Portfolio titles` and `## Reference averages`; the member pastes or acts on the rest:

- **`## Title`**: the recommended title alone in a fenced `text` block, a description of what the member does plus the keywords clients search: two or three blocks split by |, the role with its main keyword first, then more search terms with who it is for or what they get, never a bare keyword stack (see `references/profile.md`). **The limit is 70 characters**, measured from the connector's own write action and from a real title that came back cut at exactly 70, and the draft gate fails anything longer. Write one title, with its reason in a line.
- **`## Overview`**: the first two lines once on their own as a quote, because they carry the click. Then the whole overview in one fenced `text` block, no markdown inside it: Upwork shows asterisks as asterisks. The shape, in this order: (1) one short hook, a single sentence of about 20 words, in "you" and "your" on who you are and what the client gets, built from the recorded direction so it fits the title and the services, with the member's own number inside the first 250 characters when one exists; (2) three bullets, the results a client cares about most first, each a result the member stated with its number (BUILT or DELIVERED what, for whom, achieving what, with its number); (3) how you work and one objection answered, plus a differentiator only when it tells the client something Upwork does not already show; (4) a close as one imperative plus permission back to "you". It reads as one flow, connected sentences with the three bullets as the only list. Never restate what the profile page already shows: location, job and review totals, earnings, badges, the skills list. With fewer than three verified results, use those and ask the member to confirm the rest, never invent one.
- **`## Skills`**: one `- Skill` line each, in Upwork's exact spelling, as many as the live editor offers (the skill for GoHighLevel is called HighLevel). Use the names Step 3 counted in real postings; mark any you could not confirm with "(check the spelling in Upwork's list)".
- **`## Portfolio titles`**: one `- New title (was: old title)` line per project. A number goes in a title only when the proof ties it to that project.
- **`## Reference averages`**: from the role models, `- title: N` and `- overview: N` in characters, the three URLs and today's date. The gate fails a title or overview more than 20 % over these; with no role models there is no ceiling beyond Upwork's limits.
- **`## Video script`**: one connected intro pitch in a fenced `text` block, only the words to read, about 45
  seconds (around 100 words) unless the member names another length. It is **derived from
  the sections above, never invented next to them**: same direction, same results as the
  overview. It runs in one piece, with no headings and no sentences that announce a
  section: the name and who the member helps, then specific examples (what the member
  built, for whom, with what result and number; with no clear example, the member's
  experience or another strength from `context/me.md`, never an invented example), then
  one small invitation. Client first names only when the member gave them.

Write it as you would explain your work to someone you just met: friendly, warm, a little excited. Plain words, contractions, one idea per sentence, examples not boasts, no pressure, no big promises, numbers as said aloud. Close with "read it aloud once before recording; anything that trips your tongue gets cut". The member records it and gives a public YouTube link, which Step 6 sets; the video is worth 10% of completeness, and a profile goes live without it while one waiting for it never does.
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

Run `python3 code/profile_draft.py check profile.md`. It re-runs the same checks on the draft, Upwork's limits, the length ceiling from `## Reference averages`, and looks up every number in the evidence sections of `context/me.md`, the video script included. With the `video` focus run it with `--only video`, which checks the script and nothing else. Exit 1 means fix and run it again. Never loosen the draft's claims to pass, and never add a number there to make the gate quiet: those sections change only with the member's word or the connector's.

## Step 6 · Put it live, one field at a time, and report

The connector documents `update_profile` previews for the title, overview, skills (at most 20), the video (`set_video`, the member's public YouTube link), availability, employment (country as ISO code, role up to 50 characters), education, languages and other experience; none has run from this repo. When a live title, overview or skills exist, first save them in `profile-before.md` in the repository root (gitignored, the member's own words) so they can go back. Use a write only when its action returns the documented preview, otherwise hand over the paste-ready version and click path. Hourly rate, portfolio, photo, categories and the linked account stay manual.

For each writable field, create the preview and show what would replace what. Call
`confirm_preview` only after an explicit yes for that field, never one "approve all".
If the behavior differs from the documented preview flow, stop: manual handoff.

## Step 7 · Check what is online, then report

When the member says everything is online, check it. Read `get_profile` action `get`
and `list_highlights` again, fresh and never the saved files, run
`python3 code/profile_checks.py data/profile.json data/highlights.json --json`, and give
the completeness against the published percentages: the number, then two short lists.
**Online**: what the read confirms (title, overview, skills, employment, education,
languages, rate, portfolio titles). **Still yours to do**: every field missing or not
readable, each with its percentage and the exact click on Upwork (photo, categories,
rate, portfolio, linked account, and the video unless `set_video` ran). What the
connector cannot read is asked, never assumed.

Then run `python3 code/pipeline.py prune` and give the completion report as CLAUDE.md defines it: what is live, what stays manual and the completeness number, worst gap first, three lines at most. Link [profile.md](../../profile.md). Next step: `/find-jobs`. Run this command again only when something real changes (a delivered result, a new direction). End with `Upwork calls: N`, measured, never estimated; every field put live adds two.
