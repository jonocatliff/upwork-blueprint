---
description: Builds a one-page pitch site for one job and the application to submit with your Loom: cover letter and bid.
argument-hint: "<job id>"
---

# /pitch-page

Follow `references/copy.md` for the page and application. The
member described in `context/me.md` is the sender.

One page that makes a client stop scrolling: a headline about their job, three
proofs, their system drawn as a diagram they can drag and edit, the short
working-together sequence and the next step on Upwork. The Loom that walks
through this page comes after it. The application includes a cover letter, bid and any screening answers stated in the full posting.

Read first: [references/upwork.md](../../references/upwork.md) (hard constraint 8, no contact route on a page before a contract), `context/me.md`.

Before Step 1, if `jobs/<id>/pitch.html` exists, run
`python3 code/pitch_check.py page jobs/<id>/pitch.html`. When it passes, keep
that page and skip building it again. Check the pipeline record for a
`pitch_url`: with one, go straight to the Application step. Without one the page
was never published, so run Step 7 first, because the application links to a page
a client has to be able to open.

Before research or assembly, run `python3 code/preflight.py vercel`. Stop if the
publishing destination is unavailable; a pitch that cannot be published is not
ready to apply.

## Step 1 · The job and its full posting

`python3 code/pipeline.py get $ARGUMENTS`. The posting is in `details.description`. No posting there (older than a day, or never opened): `find_jobs` action `get` for this one job, then `python3 code/jobs.py detail <id> <file>` as `/find-jobs` Step 6 does. Never build from the summary: the diagram is drawn from the requirements, and the summary does not carry them.

## Step 2 · Which page is this

- **Anonymous client:** the page pitches the build.
- **The company is named in the posting:** the page opens with what you noticed about their situation, from their own words and public site. Research is fine, contact is not. Every observation must be checkable; a wrong one about their own business ends the conversation. Uncertain which company: treat it as anonymous.

## Step 3 · Understand the mechanism

For every tool or delivery discipline the posting names, check
`context/tool-knowledge/<tool>.md`. The shipped workspace already includes
implementation references for SEO and Google Ads. Read only the
ones this job uses. If a named system is not covered, research it now with
official docs first, then add the implementation decisions to its file with
sources so the next job does not pay for the same discovery again. A familiar
category is not a reason to skip this: the specific combination is what the
client is paying for.

For SEO, choose the relevant lane from `context/tool-knowledge/seo.md` before
planning, and read `context/tool-knowledge/delivery.md` for how the work is
sequenced. Put the posting's plugins, badges, privacy rules and performance
targets inside the track or step they belong to, instead of turning each
requirement into another box. For Google Ads, put verified conversion measurement
before bidding and keep media spend separate from the implementation fee. These
references guide the mechanism; they never supply proof about the member or facts
about the client.

## Step 4 · Read the posting into a plan

**Decide the plan's shape first, because it changes the rest of this step.** SEO
and Google Ads are programmes the member already runs the same way every time, so
the client is better served by the roadmap than by a drawing of it: the roadmap
shows weeks and what lands in each, and a bespoke diagram of a known programme only
proves the member drew a diagram.

- **The posting is mainly SEO, local SEO, Google Business Profile or Google Ads:**
  copy `templates/roadmap/seo.html` or `templates/roadmap/google-ads.html` to
  `jobs/<id>/roadmap.html` and edit it to this client. The file's own comment
  lists what to rewrite; three of them decide whether it lands:

  - **The h1 is the outcome this client asked for, in their words**, never the
    name of a service. A posting about missed calls gets a headline about missed
    calls.
  - **Tag the rows they named.** A fifth entry on any `ROWS` row is what they
    asked for, quoted from the posting, and it prints as a tag on that row. It is
    the whole argument of the page in one line: their request sitting inside the
    system rather than answered beside it. Tag only what they actually wrote, and
    delete the placeholder tag the template ships with.
  - **Add a row for anything they asked for that the plan does not carry**, rather
    than letting it go unanswered. A request with no row reads as a request you
    missed.

  Keep the three groups, the four tracks and the week count. They are the reason
  to send a roadmap at all: the client sees that the whole funnel is covered, not
  one piece of it. Change the row wording to their trade and city, and the note at
  the foot if the scope is narrower. Then assemble with `--roadmap` instead of `--graph`, and skip the rest
  of this step. `pitch_deploy.py` publishes it at `<id>/roadmap`, which is the
  route `--roadmap` points at.
- **Anything else, or a job that mixes SEO with real automation work:** draw the
  diagram as below. A job whose shape is its own is exactly what the diagram is
  for.

Write down, before drawing: the trigger, the systems they already run, the manual work today, where results must land, the phase two wishes, the constraints. Then five rules: use their words ("your Squarespace form", not "web form"); never invent a fact, draw a "which CRM? to confirm" node instead; mark scope with groups (what ships first, what comes later); every manual step in the posting is a step the diagram takes over; a requirement with its own sentence gets its own node.

Write the graph to `jobs/<id>/pitch-graph.json`:

- **The diagram has to earn its place.** A picture that says what a numbered list
  says is decoration, so it must show at least one of these three, and say which
  in the run: a **decision** with two outgoing edges that are both labelled, a
  **node the client already runs** (`owner: client`), or an **open question** the
  member still needs answered, drawn as its own node.
- Eight to twenty nodes, and **at least two steps per phase**. One node per phase is
  a numbered list with rounded corners, and the generator now refuses it.
- **Five roles every job has, and every graph answers:** what starts it, what the
  system decides, what happens on the normal path, what happens when it fails or
  nobody answers, and what the client sees at the end. The failure path is the one
  everybody leaves out, and it is what a client is actually buying.
- Combine technical internals that serve one outcome and explain them in the node
  note. Branches read better than one long chain.
- `nodes`: `id`, `label` (an everyday verb and outcome, ideally four words or fewer), `kind` (`source`, `step`, `sink`, `decision`, `datastore`, `service`, `actor`, `note`, `milestone`), `owner` (`you` builds it, `client` already runs it, `thirdparty` outside service), optional `logo` (a file name in `templates/pitch/logos/`) and `note` (what happens in this exact job). The note is one short sentence that names the exact tool and action, such as "GoHighLevel Workflows sends the missed-call SMS." Never add a separate benefit field or a generic explanation that would survive a different job title. A reader must understand the label without opening it.
- `edges`: `from`, `to`, optional `label`, optional `dashed` for later phases. **Every edge leaving a decision carries a label** ("yes" and "no", "answered" and "no answer after 24h"), because an unlabelled fork tells a client nothing.
- `groups`: `label` and `nodes`, one per sequential phase. Use two to five
  client-facing outcome labels, not technical buckets such as "Setup" or
  "Automation". The first phase must be the smallest useful result. The board
  turns each group's last connected step into its visible phase output.
- **SEO website jobs:** use the four tracks in `context/tool-knowledge/seo.md` as
  the **phases**, not as the nodes. Each track carries its own two or three steps,
  and the branch that matters is usually what happens to the old URLs and what the
  client has to supply. A plugin, badge, schema type or speed target belongs in a
  node note unless it changes the order or creates a real branch.

Estimate the member's effort from this same scope, not from the client's budget.
Use a low, likely and high hour case; two to five roadmap milestones whose hours
sum to the likely case; a confidence level; and every assumption that could move
the estimate. Then run:

```
python3 code/pricing.py <id> --hours <low> <likely> <high> \
  --confidence high|medium|low --contract-type fixed|hourly|unknown \
  --milestone "Foundation|hours" --milestone "Build and QA|hours" \
  --assumption "one concrete scope boundary"
```

This is the internal price guide for the member. It uses the current
Upwork profile rate and a visible scope-risk buffer of 5 percent on high
confidence, 15 on medium and 25 on low: the less the scope is pinned down, the
more the estimate carries the risk instead of the member. It never becomes the bid,
never appears on the client pitch page and never overrides a client-approved
commercial term.

## Step 5 · Assemble

```
python3 code/pitch_generate.py <id> --hook "..." \
  --build-lede "one job-specific sentence explaining the full flow" \
  --graph jobs/<id>/pitch-graph.json --kickoff "..." (repeat) \
  (SEO or Google Ads instead of --graph:
   --roadmap "The 8-week build|<id>/roadmap" --roadmap-point "..." (two to four)) \
  --updates "cadence|platform" \
  --plan-outcome "job-specific client benefit" (once per card) \
  --plan-image jobs/<id>/plan-01.jpg (once per card) \
  --hero-illustration jobs/<id>/hero.jpg
```

- **Industry treatment:** choose one restrained `--theme` and keep it for the
  whole page: `steel` for trades, construction and operations; `signal` for
  software, AI and automation; `growth` for SEO, marketing and commerce;
  `calm` for health, coaching, education and care; or `warm` for general
  professional services. The hero and card illustrations, one per card: two cards without the lead-magnet showcase, three with it do the heavier
  work: use the client's actual environment, materials and workflow. Motion may
  echo that work through depth and direction, but must remain subtle, readable
  and disabled by reduced-motion preferences. Do not add decorative gimmicks.

- **Proof stays short:** at most three client voices on the page. A fourth is
  not more convincing, it is a wall, and the client stops reading at the wall.

- **The flow board answers to a keyboard:** every node can be reached and opened
  with the keyboard alone, and the automatic scaling never shrinks a node below
  88 percent of its readable size. Below that the board looks impressive on a
  laptop and is unreadable on the phone the client actually opens it on.

- **Copy hierarchy:** lead every section and card with the result the client
  wants to feel: fewer lost leads, a calmer handoff, faster replies or clear
  control. Put the tools, features and implementation mechanics in the short
  description below. Never use a tool name or feature list as the headline.
  Keep both layers specific to this job and supported by the posting or proof.

- **Onboarding:** list only the access, content and decisions needed before the
  first build can start.
- **Updates:** name a specific cadence and where updates will live. Use Upwork
  before a contract. After hire, prefer the client's existing workspace.
- **Working together:** lead with the client outcome, then show how it happens.
  When the lead magnet is present, repeat it as Step 01 so the sequence reads
  audit, onboarding, updates. Write one short, job-specific `--plan-outcome` for
  each card. Generate one matching landscape illustration per card and pass it
  with `--plan-image` in the same order. The card images must share one style,
  show the actual project inside the client's industry and contain no text,
  logos or generic diagrams. Make the system, work or finished outcome the
  subject. People may appear only as small context; never build the image around
  a person looking at a screen, pointing at a board or posing beside the work.
  Generate the hero and card images as one coherent visual series. Inspect every
  source image before assembly, then inspect its actual crop on the finished
  page. Reject repeated compositions, fake readable UI, dominant people and any
  crop that hides the industry or the work.
- **Member photo:** when a real member photo is available, use it as the identity
  reference for one natural action portrait and pass the finished local asset
  with `--profile-image`. Never invent a member's likeness without that
  reference. The proof beside it still comes only from the Results, Reviews and Credentials sections of
  `context/me.md`.
- Do not put a budget or speculative delivery timeline on the pitch page. The
  internal pricing guide remains in the cockpit for the member.
- **Next step** (`--next-step`) points back to Upwork; the default asks them to send their website or current setup there.
- **Build lede:** one sentence that names this job's trigger, useful outcome
  and final handoff. It sits above the board. Generic claims such as "drawn
  from your posting" are not accepted.
- Optional: `--live-artifact "Label|URL"` for anything actually built and `--proof-link "Label|Detail|URL"` for past work with no contact details on it.
- **Pictures are optional and the pitch is complete without them.** When you can
  draw one, a 16:9 `--hero-illustration` earns its place: show the project or the
  finished outcome in the client's industry, not a person presenting it. Use
  people only as small context, and no text, logos or generic boxes and arrows. It
  sits in the hero directly below the headline, never inside the flow. The same
  goes for `--plan-image` per card and `--profile-image`. A path you pass that does
  not exist is still an error; passing none is not.
- Give the moving dither field a job-specific, high-contrast source through
  `--dither-source`. It must remain identifiable after being reduced to dots:
  use one simple industry object or scene, such as a roofline and ladder for a
  roofing job, not a generic particle cloud and not a detailed stock image.
  Prefer a small local SVG when simple geometry communicates the industry more
  clearly than generated art. The source is embedded in the pitch and may not
  load anything from the network.
  Keep every recognizable motif upright in every section. Horizontal mirroring
  is acceptable when composition needs it; vertical flipping is not. Roofs,
  vehicles, people and tools look broken as soon as gravity is reversed.
- When the job is tied to a local business website, offer the free SEO audit: it
  is part of the offer on every such job. Make the free upfront work
  explicit: the client sends the website, and the member returns the complete
  audit before the build. Sell the useful outcome, then name what the audit
  contains.
  Name it as a free audit in the headline or CTA. Do not make the client decode
  euphemisms such as review, insights or opportunity scan.
  Use a headline of at most eight words, one sentence of at most 20 words and these three compact deliverables: a 25-point
  Google Maps grid, a full Google Business Profile review, and a 21-point
  website review with a prioritized action plan. Adapt the nouns to the job,
  but do not replace the deliverables with a vague custom audit. Use
  `--showcase "job-specific title|short delivery promise|#next|Send your website on Upwork"`
  with three `--showcase-point` values of at most eight words each. Generate the
  safe fictional example with
  `python3 code/lead_magnet_demo.py jobs/<id>/lead-magnet-example.html --business "Example [industry]" --service "[client service]" --location "[client market]" --conversion "[desired enquiry action]"`
  and embed it with `--showcase-html`; the client can scroll and open the three
  audit sections directly. It must show the current project-local report with
  its `Google visibility`, `Google Business Profile` and `Website` sections. Never substitute an archived or external report design. A short `--showcase-video` walkthrough
  is only the fallback when an embed cannot be used; the bundled report cover is
  the final fallback. Do not expose private client data, link to a contact page
  or promise findings that have not been measured. Its fictional business,
  service, conversion and market must match the actual industry.
- Your YouTube videos appear when `context/videos.json` lists them (`{"channel": url, "videos": [{"id", "title", "thumb"}]}`); the channel page itself must show no email or booking link.

## Step 6 · The gates

- `python3 code/pitch_check.py page jobs/<id>/pitch.html`: no email, phone, booking link, messenger or social profile anywhere on the page, no unfilled placeholder. Upwork suspends accounts for contact details before a contract, and a linked page counts.
- Run `python3 code/pitch_capture.py <id>`, read the screenshot path it prints,
  then run `python3 code/pitch_capture.py <id> --clean`. Never call a page done
  unseen. The cleanup removes the temporary screenshot after the visual check.
- Inspect the hero and every plan-image crop. Check every dither placement:
  the source must be upright, identifiable and clear of the copy. If an audit is
  embedded, open it and confirm both the compact phone and expanded view render
  at a 390px document width without horizontal overflow.

## Step 7 · Publish the client page

Run `python3 code/pitch_deploy.py <id>`. It confirms the page opens publicly and
saves the exact deployment URL through `code/pipeline.py`. Never upload the job
folder, because it contains drafts.

**It republishes every page that project already holds**, not just this one:
every earlier pitch page and every published audit go up again, because one
Vercel deploy replaces the whole project. Two consequences worth knowing before
the first run. An old page that fails its own gate today stops this run with
`the previously published pitch <id> failed its gate`, and the fix is that
page, not this one. And a page pulled from the project by this member stays gone
after the next deploy.

Publishing is part of this command. A missing Vercel CLI or authentication is a
blocker, not a completed pitch. Either a Vercel CLI login or a `VERCEL_TOKEN`
works, **but not a token that belongs to a different account**: the preflight
stops when a token publishes as somebody other than `vercel login`, because that
sends a client's page into a stranger's Vercel and reports success. A token for a
team names that team in `VERCEL_SCOPE`.

## Step 8 · Application

Use the full posting from Step 1 and `references/copy.md` for
every line the client will read. The member reviews and submits the proposal
on Upwork themselves. Prepare the cover letter, screening answers when the
posting states the questions, and the bid for manual submission.

**The first 230 characters decide.** That is what the applicant card shows a
client before they open anything, roughly the first 45 words (Maker School
evidence snapshot, 26 September 2026, sources C09 and F02). Put the outcome and
the one relevant proof in there. A greeting, a name and a sentence about being
excited spends the whole visible part on nothing.

### What is true about you and the scope

List the posting's hard requirements ("built at least 5 sub-accounts for trades", "A2P 10DLC is non-negotiable") and check each against the evidence sections of `context/me.md`. **A requirement your proof does not cover never becomes a claim.** If it is mandatory, ask the member whether they meet it and where that can be checked. Until resolved, save no client-facing draft. If it is a preference, name the gap for the member and draft without claiming it. Lead with the strongest relevant proof by tier; never a badge or number the member does not hold.

Separate explicit deliverables from assumptions. Before quoting a price or
timeline, resolve the contract type, included work, dependencies, revision or
acceptance boundary and payment structure from the posting, saved member policy
or an explicit member decision. If one changes the bid, ask before writing the application. Never convert an hourly profile rate into a fixed-price quote.

When `details.price_estimate` exists, use it as the internal starting point:
show the hour cases, profile rate, risk buffer, assumptions and roadmap together.
It is an estimate, not approval. Recalculate it when the resolved scope changes,
and get the member's explicit bid decision before writing the bid.

### Write the letter

Write a compact pitch, normally 65 to 120 words and never more than 140 words,
in the member's voice, with no em-dashes. Use four short blocks:

1. One sentence on why the member fits this exact job and outcome.
2. One sentence inviting the client to watch the walkthrough, with the literal [LOOM LINK] placeholder.
3. One or two short, relevant examples from the evidence sections of `context/me.md`. Never stretch unrelated proof to fill space.
4. One specific next question or ask on Upwork.

Do not recap the posting, explain a long method, add generic praise, write a
biography or pad the pitch. Never add a guarantee, refund, free work or delivery
date as a sales device. Put answers to required screening questions in
a separate section, not in the cover letter, unless the posting explicitly
requires the answer there.

Save the cover letter to `jobs/<id>/application.md` in this exact shape so the
cockpit can present it separately:

```markdown
# Cover letter

<the complete letter>

```

When the full posting states screening questions, answer each in one or two
sentences from the posting and verified proof. A mandatory answer without
proof is a hold. Do not guess questions the posting does not state. Append:

```markdown
# Screening answers

## <the client's exact question>

<one or two sentence answer>
```

Record the member-approved bid amount through
`python3 code/pipeline.py detail <id> --file -` with a JSON object containing
`bid_amount`. Leave out costs or questions the posting did not reveal.

### The gate

`python3 code/application_check.py jobs/<id>/application.md --job-title "<exact job title>"`. Exit 1 means fix it. Then read it once as the client would: does it answer their post, or could it sit under any other job?

### Manual handoff

Present the letter, any answers, the bid and any preferred qualification the
member does not meet. Open the saved job URL on Upwork. The member pastes the
fields, reviews Upwork's final cost and submits the proposal on Upwork
themselves. Never mark Applied until the member confirms. After they confirm,
run `python3 code/pipeline.py set <id> applied`.

## Step 9 · Report

Run `python3 code/pipeline.py prune` first, because Step 1 fetched the full job. Then the completion report as CLAUDE.md defines it, with the public page and
application linked. Say what the application costs in Connects and what the balance leaves. Next step: record the Loom walking through the pitch page,
replace [LOOM LINK] in the cover letter and submit on Upwork; `/brief` then
moves the lead to Applied. End with `Upwork calls: N`.
