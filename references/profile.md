# The profile: what to measure, and what to write

Everything `/profile` needs: the checks that score a live profile, then the rules that write
the new one.

**Sources.** Upwork's help articles, read 26 September 2026, cited by article number under
`support.upwork.com/hc/en-us/articles/`; those pages carry no date. Three measured samples,
kept apart because they do not mean the same thing. "3 of 3 top earners" and "12 of 16
arbitrary profiles" are different claims.

- **3 top earners:** three high-earning profiles pulled through the connector 14 August 2026, $295,000 to $1,090,000 earned, two Top Rated Plus, plus one practitioner's bio formula. Practitioner evidence, not Upwork documentation; three profiles do not prove the pattern caused the earnings.
- **16 cross-section:** sixteen public profiles read through the connector 26 September 2026, four per lane (GoHighLevel and CRM, Make and n8n, AI chatbots and agents, WordPress). Badges none to Top Rated Plus, earnings $80 to $200,000, rates $6 to $50. A candidate sample, not a ranking: without a client account there is no way to filter by earnings or Job Success. No text was copied; a member who copies a sentence competes with everyone who did.
- **10 postings:** the ten newest GoHighLevel postings 26 September 2026, counted for their `skills` arrays.

Adjacent: connector writes in [upwork.md](upwork.md), keyword kinds and what the
work pays in [jobs.md](jobs.md). Badges, scores and certification economics are
knowledge about Upwork rather than levers this system pulls, so they sit in
`RESEARCH.md` at the root.

# Part 1 · Measure

## Completeness, the one lever Upwork admits to

Upwork refuses to explain its ranking: revealing it "could make it easier for some users to
artificially boost their rankings". It names only platform-generated data such as completed
projects and client feedback, plus the freelancer's own service descriptions. The single
stated lever is **"A complete profile increases your ranking in Upwork search results"**
([Build a 100% complete profile](https://support.upwork.com/hc/en-us/articles/34924882793107-Build-a-100-complete-profile)).
100% is also a precondition for Rising Talent and Top Rated.

Published percentages (211063188). **Mandatory half, 50% together:** photo, overview, one
employment entry, one skill tag. **Optional half:** portfolio 5% each up to 20% · further
employment entries 10% each up to 20% · further skill tags 10% · education 10% each up to 20%
· profile video 10% · one linked account 10% · certification 5% each up to 10% · one other
experience 5%.

A beginner reaches 100% without a single Upwork contract: four portfolio items, two employment
entries, two education entries, a linked account, one other experience, the video. Report
every missing field **with its percentage, cheapest first**: a linked account is ten points
for one click, a video ten for an afternoon.

**Documented is the percentage, not a ranking effect per field.** Upwork says nothing about
the video. One exception: Upwork's partner certification page, read 22 September 2026, says a
partner certification is "factored into Upwork's search and matching".

## The filters a client can close

From the connector's own `find_freelancers` description, 26 September 2026, mirroring the
talent search page: badge (Top Rated, Top Rated Plus, Rising Talent, Expert-Vetted on a
Business Plus plan), Job Success Score with 80 and 90 as presets, hourly rate range, total
earned range **and explicitly "no earnings yet"**, hours billed, completed jobs, country,
state, continent, UN subregion, Upwork timezone label, languages, English level from basic to
native, contract-to-hire, offers consultations, the paid Available Now badge. Advanced search
adds their own network and past hires, US-only, freelancer or agency, skills, "available now"
([Search for talent](https://support.upwork.com/hc/en-us/articles/17935950691347--Search-for-talent),
[Find freelancers](https://support.upwork.com/hc/en-us/articles/211063528-Find-Freelancers-and-Agencies)).

**Every one is a gate**, so an empty English level or missing timezone is a filter failed
silently, not untidiness. Score: English level, languages, timezone and location, availability
in hours, categories, hourly rate. A wrong timezone makes every reply look late. A client can
also filter **for** freelancers with no earnings, the only documented way a beginner is easier
to find.

**How the text is matched:** a boolean match against the profile text, all of these words, any
of these words, an exact phrase, exclusions. AND, OR and NOT work only in capitals; `+`, `-`
and `!` do nothing. **"Title search" matches the profile title alone**, so a title missing the
client's words drops out of that search completely
([Advanced search](https://support.upwork.com/hc/en-us/articles/17935726681875--Use-advanced-search-techniques-to-find-talent)).
Categories and skills are ANDed filters: an empty slot is a search never appeared in.

## Harvest the keywords, never guess them

Every job `find_jobs` returns carries Upwork's own `skills` array: the client's vocabulary in
Upwork's exact spelling. Pull twenty to thirty current postings in the lane, count each name,
and the top of that list is the skill set and the title vocabulary. Repeatable any month.

**10 postings:** CRM Automation and Marketing Automation four times each, HighLevel and Sales
Funnel three each, then Lead Generation, Social Media Marketing, Conversational AI, AI Chatbot,
Email Marketing, ManyChat. **The skill is called HighLevel, not GoHighLevel**, exactly what a
guessed list gets wrong.

Read the supply side too: the skills of profiles carrying a badge or real earnings. Names on
both lists come first. Every profile in the **16 cross-section** filled every skill slot it
had; recurring sets were HighLevel / CRM Automation / Marketing Automation / Sales Funnel /
Lead Generation, n8n / Make.com / Zapier / API Integration / AI Agent Development, AI Agent
Development / AI Chatbot / Python / LangChain / RAG / OpenAI API, and WordPress Development /
Elementor / WooCommerce / Page Speed Optimization.

Three kinds of words: the tools the client runs, the role titles they hire for, the problem
words they use when they do not know the solution. A title built only from the last kind
competes with everyone.

## The warning in the data

Two of the **16 cross-section** claim "Top Rated", "100% Job Success" or "250+ clients" in
overview text while the connector's aggregate shows no badge and ten or five completed jobs.
**A badge named in an overview is not evidence.** Judge the real badge and aggregate, never the
sentence, and never write a claim the member cannot back from `context/proof.md`.

## What is not a lever, so do not score it

- **Documented absence:** the old article on how profiles are ranked returns 404, the Job Success Score pages never mention search, and response rate, activity and hourly rate appear nowhere as ranking signals. Rotation through results appears only in community threads, never a moderator answer. A vendor blog naming seven exact signals from "730,200 job posts" publishes no method and sells its own tooling: advertising.
- **Job Success Score's only documented consequence:** below 79% "you may find it difficult to connect with new clients" ([Job Success Score](https://support.upwork.com/hc/en-us/articles/211068358-Job-Success-Score)).
- **Boosted profile** is a pay-per-click auction: bid in Connects plus relevance decides the slot; a click, save, invite, hire or video view is billed at most once per client per job post, inside a daily and total cap ([How to boost](https://support.upwork.com/hc/en-us/articles/20850487528723-How-to-boost-your-profile)). Upwork promises only "may help you gain increased visibility", with no number for profiles; the circulating 24% belongs to boosted **proposals**. Its claimed effect moved from 37 and 43% in beta to 55% in 2023 to "up to 24%", always relative, never against a stated baseline. A boosted row carries the rank it would have held unpaid.
- **Availability badge:** bought weekly at a demand-driven price. Upwork claims "up to 70%" more job invites while indexed snippets of the same page still say 50%: marketing, not measurement. It explicitly does **not** change search position ([FAQ](https://support.upwork.com/hc/en-us/articles/40368040805907-Does-this-increase-my-visibility-to-clients-Will-I-appear-higher-in-search-results)).
- **The one measured test:** Morgan Overholt, 30 proposals, April 2024. Baseline 50% proposal views, 20% replies, 10% hires. The badge week **dropped** views to 20%. Boosted proposals reached 80% views for $32.70 in Connects across ten applications. Boosted profile: minimal change, zero invites ([Are Upwork's paid features worth it](https://morganoverholt.com/upwork/upwork-paid-features/)). One person, 30 data points, two years old: indicative, not transferable.
- **Specialized profiles are gone.** Removed 28 May 2026, titles, overviews and skills deleted for good; Upwork states rankings did not change (115013750068). One profile, one direction. Blogs calling this the new "profile dilution" gatekeeper contradict Upwork, and neither side measured anything.

## When there is no Upwork history yet

Proposals are sorted by the profile, the Job Success Score and how well the cover letter
matches the posting, and a client sees the **photo, title, rate and JSS** before opening
anything
([Why are my proposals not being viewed](https://www.upwork.com/resources/why-are-my-proposals-not-being-viewed)).
Without a JSS the member starts structurally behind by Upwork's own account, so those four
must be right.

Under 9% of projects posted in 2025 were open to freelancers with no history, down from roughly
15% in 2024; IT around 4%, admin, translation and customer service near 20%
([Vollna, 2.2 million projects scraped, about 95% coverage](https://www.vollna.com/reports/upwork-projects-trends-2025)).
A vendor's scrape, not Upwork's data, page undated. The four default lanes are technical, so
they sit at the 4% end. Say that out loud.

A peer-reviewed study of 60 freelancers found "workers' non-platform experience contributes
little to their platform-specific reputations"
([Administrative Science Quarterly, 2026, reported September 2026](https://phys.org/news/2026-09-online-platforms-misaligned-late-career.html)).
What survives it: prior experience buys **no reputation**, and a client still reads the
overview with their own eyes. Background belongs in the copy, never in a claim about standing
on the platform.

**Rising Talent** comes by Upwork's invitation or by the published bar: 100% complete profile,
an application or work inside 90 days, an average of 4.8 stars and at least $250 earned in
twelve months, and a JSS of 90% or better if one exists (360049702614). Measurable benefit: 30
Connects, about $4.50, plus the badge and consultations. No ranking weight published, so treat
it as a side effect of doing the work, never a goal.

**Application volume against profile quality has no beginner data at all.** Never imply it does.

# Part 2 · Write

Every claim carries its own evidence or it does not get written. A missing number stays
missing; an invented one ends at the first client call.

## Title

Its own search field: clients can restrict a search to titles alone (1500007918681). **The
limit is 70 characters**, from the connector's `update_title` tool description and confirmed by
a real title that came back cut at exactly 70; the help articles are silent on it.

Two to five blocks divided by `|`, every block a word a client types (a service, a tool or an
audience), never a slogan or benefit phrase. **16 cross-section:** 55 to 70 characters, pipes
in 12 of 16 (rest used commas, hyphens, tildes or a prepositional phrase), shape almost always
**tool, then a role noun, then a deliverable noun**; verbs appeared once in sixteen, a number
once, a badge word twice, a price or number of years never. All **3 top earners** use pipes.

## Overview

Upwork states **only the first 250 or so characters appear in the search results list**
(360016252373), so the opening decides alone. No documented length limit.

**Open with the client's problem or an outcome**, or a verified hard number, never a biography.
Shapes from the **3 top earners**: outcome first ("I help businesses increase revenue by
improving customer acquisition, conversion rates, and retention"), ownership plus proof ("When
you hire me I take responsibility for the profitability of your ADS and FUNNELS. $10M+ in sales
generated"), or the differentiator, one technical partner "instead of clients juggling 3-4
specialists who blame each other when systems break".

**Proof front-loaded, strongest first.** **S, closers:** video testimonials, detailed case
studies with hard numbers, Top Rated, 100% Job Success, $100K+ earned on Upwork. **A:** top 1%
for a skill, major press, 100+ reviews, 100+ projects, spoke at events. **B:** hours saved,
client revenue earned, named big-brand work. **C:** certifications, years of experience,
following, systems built.

**Results carry numbers, not adjectives**, one line each:
`BUILT/DELIVERED [what] for [kind of company], achieving [specific result with number] in [timeframe]`.

**Structure from Unicode bold or emoji, because Upwork strips markdown.** Two of the **3 top
earners** use 𝗯𝗼𝗹𝗱 headers, the third emoji. In the **16 cross-section** Unicode bold headers
are the norm only in the AI lane.

**A keyword block near the end**, for search rather than humans. One of the **3 top earners**
heads it openly "Keywords humans can ignore", another folds it in as "Technology expertise:
...". It costs a line and covers spellings the prose never uses.

**Rhythm (16 cross-section):** one line is one sentence of 6 to 14 words, paragraphs 1 to 3
sentences. The exception matters: the two highest earners in that sample, at $100,000 and
$200,000 plus, **write real prose** with 25 to 40 word sentences and almost no emoji, while
checkmark lists correlate with the lower earnings. Lists are what a beginner reaches for.

**Perspective flips twice:** hook in "you" and "your", middle in "I build" and "I help", close
as an imperative back to "you"; twelve of sixteen hinge on "let's". The measured ratio is less
flattering: roughly 15% of the text is the reader's problem, 70% the freelancer's abilities,
10% the reader again. Only two hold the reader's side throughout.

**Section openings**, four kinds: a bare heading (dominant), a pain sentence, a question, an
outcome promise. **The pain sentence separates the three strongest GoHighLevel and automation
profiles**, and it is the cheapest thing for a beginner to write well, because it needs no
history.

**Objections**, three moves: a negation list (no duplicated workflows, no overloaded
pipelines), FAQ-style headings (used once, by the most complete profile in the sample), a
reliability promise. Eleven of sixteen answer "it will not break", six answer "you will own and
understand it".

**Verbs:** build is the backbone in all sixteen, then automate, convert, capture, scale,
integrate, qualify, nurture. Fix appears only where repair is the product, in GoHighLevel and
WordPress.

**Close with one imperative plus permission**, "send me what you have, even if it is messy".
Fourteen of sixteen do; **not one closes by talking about itself**. The sharpest of the **3 top
earners**: "Send a 2-3 sentence brief: what you're building, your current stack, and the
specific problem you want solved."

**Optional, because only some do it:** testimonials inside the overview (quotes if they name
real people, badges if not), spelled-out pricing tiers (one of three; fits a wide audience,
clutters a narrow profile), a week-by-week "how I work" (strong for large engagements, overkill
for small).

**Remove:** "I would love to", "I'm excited", "passionate", "results-driven", "rockstar",
"ninja", an opening that restates a job title, a close on a broad claim such as "AI is the
future of business". None of the **3 top earners** uses any. Removed because they spend
attention without helping the client decide, not because a three-profile sample proves a
conversion rule.

**What nobody in the 16 cross-section does**, every item free: no prices, no disqualification
criteria ("this is not for you if"), no availability window, no date marker on any claim, no
numeric guarantee (one exception promised a PageSpeed score above 90), no plain text without a
checkmark except the two prose profiles. Each is a way to be the only profile in a search that
does it.

**Never compare a beginner against the 3 top earners head-on.** What transfers is the form:
outcome first, numbers over adjectives, structure, keywords, a clear ask. The proof gets filled
with what the person genuinely has.

## Skills

ANDed filter fields. **Upwork contradicts itself on the cap:** "up to 15 skills" (360016252373)
against "up to 20 skills to your profile" (211060318). The connector's `set_skills` documents
20; 2 of the **3 top earners** carry 20 and one carries 15; all of the **16 cross-section**
fill every slot they have. **Read the real cap in the live editor and claim no number from
memory.** Fill every slot: an empty one is reach given away, a wrong spelling a filter failed
without knowing. Soft-skill tags are separate: generated by Upwork from public reviews, not
editable, no effect on the Job Success Score (45958886350099).

## Portfolio

Documented limits: title up to 70 characters, role up to 100, description up to 600, up to 5
skill tags, images recommended at 1000 by 750 and at least 400 by 300 (360016144974). Linking a
real Upwork job notifies that client, who has three days to object. **No contact details in the
files or on any page they link to.** Each item is 5% up to 20%, so **four items** is where
completeness caps out. A title carries a number only when `context/proof.md` ties it to that
project. Unmeasured: the connector returns no portfolio array, so nothing about how the sampled
profiles title their items.

## Intro video

A YouTube link with monetisation off. No documented length limit; 30 to 90 seconds is practice.
Worth 10% of completeness, the only documented reason to make one. The circulating "30% more
views" traces to a page that cannot be opened and has no other support.

## The remaining fields

**Hourly rate.** The connector cannot set it. Upwork says the rate "helps clients filter search
results" (360016252373). A band from the measured discipline and the experience level a client
would pick, moved by verified proof and nothing else; never a country discount, never empty. It
anchors every later bid, so `context/me.md` carries it and `/pitch-page` reads it there. Nobody
in the **16 cross-section** names a price in the profile itself.

**Profile photo.** A real portrait, one of the four things a client sees before opening
anything. No sunglasses, logos, clipart, group photos or edited images (360016252373).

**Employment history.** Up to 100 entries, 10% each up to 20%, so two entries are free points.
Every relevant role with employer, title and period, including work outside freelancing. Each
entry says what that employer's customer got, not what the job was called.

**Education.** 10% each up to 20%. Optional, never padded.

**Languages.** Each with its proficiency, plus the English level Upwork asks for separately.
Honest: a client who books a call on "fluent" and meets "conversational" is a refund.

**Availability.** Hours per week and open to offers, matching the hours they can really answer in.

**Location and timezone.** Clients filter by both, including a US-only filter.

**Categories.** Upwork disagrees with itself again: "up to four categories … Your profile will
be displayed in these categories when clients search through them" (360016252373) against up to
10 elsewhere. Pick what matches the direction from `/context`, not the member's old job. The
expensive mistake is a boost, which targets category plus specialty.

**Linked accounts.** 10% for the first, the cheapest percentage point on the list.

**Certificates.** 5% each up to 10%. Only what can be checked, never the lead (tier C).
Upwork's own Skill Certifications are discontinued, and of the 40 newest postings across the
four lanes exactly one mentioned a certificate. The one with a documented return is **Partner
Certified Talent**: 150 free Connects per partner certification, and Upwork says it feeds search
and matching.

**Other experiences.** Up to 100 entries, 5% for the first. Volunteer work, a side project, a
system built at a non-freelance job. Nobody in the **16 cross-section** uses it, which makes it
free space for a career changer.

**Testimonials.** **Upwork no longer accepts new testimonial requests** (1500002004322).
Existing ones stay, can be shown or hidden, cannot be edited, and do not affect the Job Success
Score. Any guide telling a member to collect them is out of date.

## What Upwork forbids in a profile

- **No means of direct contact anywhere in it:** phone, email, address, a link to a contact form, an external application system, social handles. User Agreement 7.2, version 8.2 effective 20 July 2026, calls a breach material and permanent suspension possible.
- **One account and one freelancer profile** without written permission (1.4).
- **Nothing accurate left out and nothing invented** about identity, location, business, skills or services (1.3).
- **No other people's work in the portfolio**, no advertising for services outside Upwork, no personal contact details (360016252373).
- **No invented relationship** to a company or person, and no subcontracting without the client's consent (9127142196243).
- Documented absence: **no rule against a guarantee or a money-back promise.** Checked the full agreement and the profile policy pages. The Blueprint still avoids them, because a promise the member cannot keep costs the contract, not because Upwork bans them.

## Done

Every field carries content or a named reason why it stays empty, and the completeness
percentage on the Find Work page reads 100. A first profile may be thin in portfolio, video and
testimonials and strong in title, overview, skills and employment history, the four a beginner
can fill fully on day one. The connector's title, overview and skills writes are documented as
previews and untested, so paste-ready text always ships with them.
