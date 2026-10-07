---
description: Everything about you, once: your work history, what you can do and every result you can prove. Every other command reads it.
argument-hint: "[a CV file, a LinkedIn or portfolio URL, or focus: background | offer | terms | voice | proof]"
---

# /about-me

The first command, run once the Upwork connector is connected and before any text a client reads. It fills `context/me.md`, which every later command writes from. Nothing is public or sent: it reads your own profile and the market and writes one local file.

Follow `references/copy.md` for how to ask. Read
[references/profile.md](../../references/profile.md) first: it says which facts
carry weight, so the questions stay in that order, what has to be on the table
before a profile can be written, and what holds up for a member starting from
zero.

**What this is for.** Learn this person's history on two levels: the career (what they did, for whom, for how long, what they were trusted with) and the skill (what they can do today, how well, on which tools). Most members skip the second, and a profile built on job titles alone reads like a CV nobody asked for. Then lay the base for an Upwork career: one specific person solving one specific problem for one kind of client, at a price, with something behind the claim. A question that serves neither is dropped; an answer that opens a door to either is followed even when it is off the list.

**Ask with the slots in mind.** The title needs a position (the role a client types, then who it is for), the first 250 characters of the overview an outcome or hard number, each portfolio title its own number, the video script up to three proofs, and `/find-jobs` the track, its services and the tool names. A loose answer leaves an empty slot that `/profile` can only fill with adjectives.

**Input:** $ARGUMENTS. A path to a CV or a URL is material to read, see Step 1.
A focus value runs only that block and rewrites only its part of the files. An
input that is neither gets the list and a question.

## How this sounds

This is an interview, not a form. The difference is not politeness, it is order.
A form hands over every question at once and takes whatever comes back. An
interview asks one thing, listens, and lets that answer decide what comes next.

So each block below opens with one question, never its whole list. What the
member says steers the rest: name back what you heard in a line, ask the one
thing their answer left open, move on. A block answered fully in one go is
finished, so do not walk the rest of its list to look thorough.

Three limits keep this an interview rather than an interrogation:

- **At most three exchanges per block.** Then take what exists, say what stayed
  open, and go on. Nothing here is something the member has to produce.
- **Never ask what an answer already gave you.** Years named in a CV, a price
  mentioned in passing, a rate that came up on its own: confirm it in half a
  line, do not ask for it again.
- **One question at a time, unless two are really one.** Timezone and the hours
  they answer messages are one question. A working life and a price are not.

Open each block by saying what it is for and roughly how long it takes, so the
member can see the end of it from the start.

## Has this already run?

Run `python3 code/workspace.py`, then `python3 code/context_check.py --status`.
The first word of its answer decides which of two commands this is, and it is
read before anything else is said to the member.

**untouched** means nothing here has ever been answered. Run the whole thing:
Step 0, then the four blocks.

**partial** or **complete** means the member has been through this before. Do
not interview them again. Say what stands, in their words, in under ten lines:
what they are hired for, the services with their prices, and how many
proof entries carry a verified status. Then name what is still open as one list
and ask which of it they want to fill now. Wait for that answer. A focus
argument skips this question and goes straight to that block.

## Step 0 · The connector, then what already exists

Check the Upwork connector first: call `list_accounts`. With no answer, walk the
member through connecting it as CLAUDE.md says and wait. Nothing below runs until
it answers, because the interview reads the live profile and checks demand on
Upwork.

Say nothing about other tools: `/pitch-page`, `/lead-magnet` and the rest check their
own needs when they run, and nothing else blocks this command. Run `./setup.sh`
quietly (safe at any time: it creates missing files, never overwrites).

1. Read `context/me.md`. A line reading "not answered yet"
   is an open question, anything else is an answer to confirm, not to ask again.
2. **Read the profile they already have.**
   `get_profile` action `get` saved to `data/profile.json`, `get_profile` action
   `list_highlights` to `data/highlights.json`, and `list_contracts` action
   `search` on closed contracts, which names what clients actually hired them
   for. Three calls, and `/profile` reuses these files for a day rather than
   paying for them twice.

   **No profile, or a nearly empty one** (no title and no overview, or just a title or a
   few lines)? The normal start: say so in one line, skip the rest of this item and go to
   Step 1.

   Settle every difference between the live profile and the CV here, one line each,
   so `/profile` never has to ask: education, language level, timezone, and each claim
   in the overview (where can it be checked, or does it go).

Say what is there in a few lines and ask what has changed since, rather than starting at nothing.

   **Nothing in it is proof.** A result the member claimed in their own profile
   is a question to verify, recorded with the source "self-authored Upwork
   profile, <date>". Only what they confirm, with somewhere to check it, becomes
   verified. A contract title proves they were hired, never that a number
   happened.

3. **Job Success Score and intro video** are not in these responses. Step 3 handles them; leave unknown values open.

## Step 1 · Background, the whole working life

**Offer the search, then wait for the yes.** The first thing this command says is one question with three ways to answer: paste the text of a CV, old portfolio page or LinkedIn profile, name a file, or say yes and you look through their computer for CVs, portfolios and similar files.

**Do not go looking before the yes.** Until they answer, open nothing outside this
repository: no listing, globbing or grepping their folders. After a yes, or a
path like "somewhere in my Documents", search that scope for CVs and similar
files, list what you found by name only, and read only the ones they confirm.

A URL: fetch it once; LinkedIn and most profile pages sit behind a login
and return nothing, so ask for the paste rather than guessing what is on it.
Never invent an employer, a title or a year that the material does not carry.

From that material, list back what you found, one line per job, and ask only
what is missing or unclear. Everything a CV claims is the member's own wording:
it becomes a fact with a source and a date, never verified proof by itself.

Then open the block and say why: a profession outside freelancing is usually a new profile's strongest asset, and most members leave it out.

Ask this, and only this, first:

1. **Every job you have held**, with the years and what you actually did there.
   Trades, shifts, teaching, coaching, support, sales, anything. No filter yet.

Their answer decides the rest: a missing year, a three-word job or a dropped side project are the follow-ups. Ask the three below only where the answer did not already carry them:

2. **What you were good at** in those jobs, in your words.
3. **Education, certificates and languages**, with the year.
4. **What you have built or delivered for someone**, paid or not, on or off
   Upwork.

Then say, in two lines, which parts of that transfer to the work they want (what a client pays for) and which are only biography.

## Step 2 · The offer

The goal is one choice: a branch. Keep this step to one exchange.

1. **Offer the five branches.** Read `templates/profile/lanes.md` and frame them as our
   recommendation, not a menu: five branches with steady demand on Upwork, each with a
   course in the community (say "branches", not "lanes"). Show each with its services
   and ask which they can deliver today and which they could grow into. Take their picks
   as given and write the branch, its services and its Tools line into `me.md` yourself.
   Never narrow within a branch, never audit what they left out, and ask nothing about
   deliverables, tools or prices. Say that the first ten applications test the choice.
2. **Say back where they stand**, in one line: one branch means decided, two or three
   mean leaning (the profile leads with the strongest, the search covers all), none means
   open (keep the search wide). Let them correct it, and write their word, never a
   narrower service they did not name.
3. **Another expertise, only when it is clear.** The member names one, or the CV clearly
   shows one that no branch covers. Add it as a custom addition (no template, no course,
   harder to sell) and ask once what the client ends up with and which tool it runs on,
   because `/find-jobs` searches on exactly those two. Check the demand with `find_jobs`
   search only, rows only, call budget stated first: postings of the last 7 days, median
   price and proposal counts with n and today's date. Flag low demand, let the member
   decide, never block. A no stays a no. If the CV shows a clear strength inside a branch,
   say it in one line and ask whether to lead with it. Propose no niche.
4. **Industries:** one short question, written as `**Industries you want to work with:**`
   in `context/me.md`; `/find-jobs` reads it. Do not ask what they will not do.

## Step 3 · Terms and voice

The shortest block, and often one exchange. Point 2 usually needs no question,
because this conversation has already shown how they write. Not asked here: the
hourly rate, which `/profile` settles once it has seen what others charge, and the
applications per day, which is ten until the member writes
another number into `**Applications per day:**` themselves. Mention that once.

1. **Timezone and the hours** they answer messages.
2. **How they want to sound**: the default is an approachable, professional sales
   expert who makes the next decision easy. Ask only what deviates from it, and
   take the rest from how they write in this conversation.
3. **Only when the live read found a profile:** its public URL into
   `**Public Upwork profile URL:**` and the Job Success Score from below their name. A
   new member has neither, and `/profile` records the intro video: ask nothing.

## Step 4 · Proof, and go after the numbers
The profile lives or dies here: a hard number in the first 250 characters beats any adjective, and nobody volunteers numbers. Ask for them per project, not once in general.

**Walk every project, job or build from Step 1 and ask along this ladder.** Stop
at the first rung that produces something real:

1. **Money.** Revenue it earned, cost it cut, a deal it closed. How much, over
   what period?
2. **Time.** Hours a week it saved, how long something took before and after.
3. **Volume.** Leads, bookings, tickets, members, no-shows, followers: the count
   before and the count after.
4. **Scale.** How many people, locations, products or clients it ran for, and how
   long it has been running.
5. **The client's own words.** A review, a message, a recommendation, and where
   it sits.

When an exact figure is gone, take the range the member is sure of and write it
as a range with its source. "Roughly 8 hours a week, from the client's weekly
report" is proof. "Significant time savings" is nothing.

Write each result in the shape the formula uses, so `/profile` can lift it
without rewriting: BUILT or DELIVERED [what] for [kind of company], achieving
[result with number] in [timeframe]. `/profile` leads with the results a client
cares about most.

Every entry carries **where it can be checked**, the date and a status:

- **verified** when the member gives a clear number or outcome and says where it
  can be checked, in their own words ("my records", "the client"), or an Upwork
  aggregate carries it. Take a clear figure as given: ask once for the place,
  accept any answer, never ask twice, and never hold a claim back because the
  place is vague.
- **pending** for estimates and anything vague. A pending claim never reaches a client.

**When there is nothing on the ladder at all**, help instead of pressing. Look together for a system built for the current job, an unpaid build for a friend, a study or course project with a result, volunteer work, or a process improved at work. Name what it proves anyway, with its source, as pending.

If that search comes up empty too, write "Nothing recorded yet" and move on.
`/profile` then leads with the offer and the background instead of a number, and
the first delivered job fills this file.

Never write a number the member did not give. Never round one up. An invented
number is worse than a missing one, because the first client call exposes it.

## Step 5 · Write the file

Keep the shape of the starter, replace every "not answered yet" you have an
answer for, and leave the rest as it is. At the top: what it is, the date in
words, and the one next action. No tables, no raw JSON, no ids.

`context/me.md` gains the background as its own section: one block per job with
the years, one line on what transfers. That section is what `/pitch-page` reads
when a posting names an industry the member has actually worked in.

## Step 6 · The gate

Run `python3 code/context_check.py`. It counts what is still open: a starter line
nobody answered, a proof entry without a status, something marked verified with no
place to check it. **Nothing here is a requirement the member has to produce.** A
person without a CV, without numbers and without a single review is a normal
starting point, and the gate's list is the to-do it leaves behind, never a wall
in front of the next command. Fix what an answer exists for, leave the rest open,
and say which ones stay open. Never answer a question on the member's behalf.

## Step 7 · Report

Before the completion report, show the member what is now in their files: the content, in their own words, so a wrong line is visible without opening anything.

**What you are on record as.** The one thing they are hired for, each service
with its price beside it.

**What you can prove.** Every proof entry, verified and pending kept apart,
strongest first. A pending claim never reaches a client, so say plainly which
ones those are and what would move them to verified.

**Where it lives.** [context/me.md](../../context/me.md), the one file every later
command reads. Name any other file this run created or changed, and say that it is
the member's own and is never touched by `git pull`.

Then run `python3 code/context_page.py --open`. It renders that file into [context/overview.html](../../context/overview.html) and opens it: what they sell, how they work, proof verified and pending side by side, every gap marked as a gap. Say it can be rebuilt any time with the same command.

Then the completion report as CLAUDE.md defines it: how many questions stayed
open and which single answer would be worth the most. Next step: `/profile`, which measures
the live profile and then writes the one that fixes it.
End with `Upwork calls: N`: the account check, the profile, its highlights and the
closed contracts, plus one search per custom direction checked.
