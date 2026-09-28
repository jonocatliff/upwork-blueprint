---
description: Everything about you, once: your work history, what you can do, what you will not do, your rate and every result you can prove. Every other command reads it.
argument-hint: "[a CV file, a LinkedIn or portfolio URL, or focus: background | offer | terms | voice | proof]"
---

# /context

The first command, before the connector and before any text a client reads. It
fills `context/me.md` and `context/proof.md`, and every later command writes from
them. Nothing here touches Upwork and nothing here is public.

Follow `references/copy.md` for how to ask. The ten working rules in
[references/upwork-method.md](../../references/upwork-method.md) decide what counts as
proof and what stays a question. Read
[references/profile-formula.md](../../references/profile-formula.md) first: it
says which facts carry weight, so the questions stay in that order. For a
member starting from zero, [references/upwork-beginner.md](../../references/upwork-beginner.md)
holds what actually holds up, including which categories are open to someone
without a history.

**Ask with the slots in mind.** Every answer here lands somewhere later: the
title needs three or four words a client types into search, the first 250
characters of the overview need an outcome or a hard number, each portfolio title
needs its own number, the video script needs up to three proofs, and
`/find-jobs` needs the niche and the tool names. A loose answer is not a small
loss; it is an empty slot that `/profile` cannot fill with anything but adjectives.

**Input:** $ARGUMENTS. A path to a CV or a URL is material to read, see Step 1.
A focus value runs only that block and rewrites only its part of the files. An
input that is neither gets the list and a question.

## Has this already run?

Run `python3 code/workspace.py`, then `python3 code/context_check.py --status`.
The first word of its answer decides which of two commands this is, and it is
read before anything else is said to the member.

**untouched** means nothing here has ever been answered. Run the whole thing:
Step 0, then the four blocks.

**partial** or **complete** means the member has been through this before. Do
not interview them again. Say what stands, in their words, in under ten lines:
what they are hired for, the services with their prices, the rate, and how many
proof entries carry a verified status. Then name what is still open as one list
and ask which of it they want to fill now. Wait for that answer. A focus
argument skips this question and goes straight to that block.

## Step 0 · The machine, then what already exists

This is the first command a member runs, so it is also the only place where a
half-installed machine gets noticed. Run `./setup.sh` yourself (it is safe to run
again at any time: it creates missing files, never overwrites) and read its gap
list. Then **do not paste the list**. Walk it by when each item first matters:

- **Nothing here blocks this command.** `/context` writes two local files and
  touches no service. Say that first, so a member with an empty `.env` keeps going.
- **The connector is the only thing needed for step 2.** `setup.sh` cannot do it:
  the folder ships it in `.mcp.json`, so Claude asks to trust it on the next start
  here; approve, then `/mcp`, pick upwork and log in. Name it now, because
  `/audit` stops without it.
- **Node and the Python packages** are needed at `/pitch-page` and `/lead-magnet`,
  not today. Give the one command per gap, in the order the gap list prints.
- **The API keys cost money and are needed at step 7 at the earliest.** Tell them
  what each one buys and that the cheapest start is DataForSEO's free credit;
  a missing `OPENAI_API_KEY` only turns two chapters into "not measured".

One sentence per gap, then start Step 1. Never wait for an install here, never ask
the member to choose which keys to buy, and never withhold the questions below
because something is missing.

1. Run `python3 code/workspace.py`.
2. Read `context/me.md` and `context/proof.md`. A line reading "not answered yet"
   is an open question, anything else is an answer to confirm, not to ask again.
3. Read `data/profile.json` when it exists: the profile text, the skills, the
   aggregates. A result already claimed there is a question to verify, with the
   source "self-authored Upwork profile, <date>".
   Do not promote it to verified proof merely because it was already public.
4. When the Upwork tools happen to be connected, `list_contracts` action
   `search` on closed contracts names what clients hired the member for. Skip it
   without a word when they are not: this command runs before the connector.
   Nothing from that answer is saved as a file. What the member confirms about
   their own history goes into `context/proof.md` as their record, the way a CV
   entry would, and the response itself is not kept, so there is nothing for
   `prune` to expire and no cached Upwork content sitting on disk.

Never ask for anything one of these already answers.

## Step 1 · Background, the whole working life

**Ask for the material, never go looking for it.** A CV, an old portfolio page or
a pasted LinkedIn profile answers most of this in one go, so the first thing this
command says is a question: is there a file, and where, or paste the text
straight into the chat. Then wait.

**Search nothing.** Do not list, glob or grep the member's disk, their home
folder, their Documents or their Downloads for something that might be a CV.
Their machine is not this command's to read. Open exactly the one path they
name, nothing beside it, and if they name none, ask the four questions below
instead. A URL: fetch it once; LinkedIn and most profile pages sit behind a login
and return nothing, so ask for the paste rather than guessing what is on it.
Never invent an employer, a title or a year that the material does not carry.

From that material, list back what you found, one line per job, and ask only
what is missing or unclear. Everything a CV claims is the member's own wording:
it becomes a fact with a source and a date, never verified proof by itself.

Then ask, in one message, and say why: a profession outside freelancing is
usually the strongest thing a new profile has, and most members leave it out.

1. **Every job you have held**, with the years and what you actually did there.
   Trades, shifts, teaching, coaching, support, sales, anything. No filter yet.
2. **What you were good at** in those jobs, in your words.
3. **Education, certificates and languages**, with the year.
4. **What you have built or delivered for someone**, paid or not, on or off
   Upwork.

Then name, back to the member, which parts of that transfer to the work they
want: the ones a client pays for, and the ones that are only biography. A gym
floor teaches consultation and adherence; a call centre teaches objection
handling. Say which is which and why, in two lines.

## Step 2 · The offer

One message, after Step 1 is written:

1. **The one thing you want to be hired for.** Their words, not a category.
2. **The services they actually sell**, at most five, and per service four
   things: what the client receives at the end, the price or range they would
   quote, how long it takes, and the tool it runs on. This is the service list
   every later command works from. `/find-jobs` scores a posting against it,
   `/pitch-page` builds scope and price from it, and `/proposal` quotes it. A
   service without a deliverable and a price means every job after this one gets
   invented from scratch. Missing numbers stay missing: write "not priced yet"
   and move on, and `/pitch-page` asks for the bid instead.
3. **How settled that direction is.** Ask it plainly, because everything after
   this behaves differently:
   - **decided**, they name the specialization: `/profile` leads with the niche
     and `/find-jobs` scores narrowly against it.
   - **leaning**, they name two or three candidates: the profile leads with the
     strongest one, the search covers all of them, and the first ten
     applications decide instead of an opinion.
   - **open**, no tendency yet: propose two or three directions out of their
     background with the reason each, let them pick one to test, and keep the
     search wide until replies say something. Never write a specialization into
     a profile that the member has not chosen.

   With nothing in the background to point at, offer the Blueprint's default
   four, each one a lane a beginner can enter with tool skill rather than years:
   GoHighLevel for agencies and local businesses, workflow automation with Make
   or n8n, AI assistants and chatbots on top of either, and small business
   websites. Pick by overlap with the jobs they have held, not by what sounds
   biggest, and say that the first ten applications test the choice.
4. **What you do not do.** One line. It protects every later proposal.
5. **The niche their background points at**, proposed by you with the reason,
   then confirmed or corrected. A profile that serves everyone reads as serving
   no one, and in most professions none of the top three owns a niche.
6. **The tools and systems** they can name confidently, for search.

## Step 3 · Terms and voice

One message:

1. **Hourly rate**, and the smallest project worth taking. Propose a band from
   [references/upwork-market.md](../../references/upwork-market.md) for their
   discipline and the experience level a client would pick, say where inside it
   you put them and why, and name what would move them up. There is no
   evidence that a low rate wins work, so never talk them down to compete.
2. **Timezone and the hours** they answer messages.
3. **Applications per day** they can really carry.
4. **How they want to sound**: the default is an approachable, professional sales
   expert who makes the next decision easy. Ask only what deviates from it, and
   take the rest from how they write in this conversation.

## Step 4 · Proof, and go after the numbers

This is the step the profile lives or dies on. The formula's first 250 characters
carry the client's decision, and a hard number beats any adjective there, so a
vague answer here costs the member work later. Nobody volunteers their numbers.
Ask for them, per project, not once in general.

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
[result with number] in [timeframe]. Then tag its tier from
`references/profile-formula.md`: S for testimonials and case studies with hard
numbers, A for reach and volume, B for outcome numbers, C for certificates,
years and systems built. `/profile` leads with the highest tier that exists.

Every entry carries **where it can be checked**, the date and a status:

- **verified** when the member says where it can be checked, or an Upwork
  aggregate carries it.
- **pending** for everything else. A pending claim never reaches a client.

**When there is nothing on the ladder at all**, help instead of pressing. Go
looking with them: a system they built for the job they hold now, an unpaid build
for a friend's business, a study or course project with a result, volunteer work,
a process they improved where they work today. Most people have one and do not
count it, because nobody paid for it. Name what it proves anyway, with its
source, as pending.

If that search comes up empty too, write "Nothing recorded yet" and move on.
`/profile` then leads with the offer and the background instead of a number, and
the first delivered job fills this file.

Never write a number the member did not give. Never round one up. An invented
number is worse than a missing one, because the first client call exposes it.

## Step 5 · Write the two files

Keep the shape of the starters, replace every "not answered yet" you have an
answer for, and leave the rest as it is. Top of each file: what it is, the date
in words, and the one next action. No tables, no raw JSON, no ids.

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

Completion report as CLAUDE.md defines it. Say how many questions are still
open, and that every later command reads these two files. Next step: `/audit`,
which measures the live profile, or `/profile` directly when there is no profile
yet. End with `Upwork calls: N`, normally 0.
