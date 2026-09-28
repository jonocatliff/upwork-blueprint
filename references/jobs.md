# Jobs: where they come from, and what they pay

`/find-jobs` reads the first half (which searches fill the pipeline, which client signals
disqualify a posting), `/context` the second (which rate to propose, with what confidence). Every
figure carries its source, date and sample size, because the most quoted rate table on the
internet turns out to cite itself. Read 26 September 2026.

## Where the jobs come from

Source for this half: a Maker School masterclass by a member reporting four closed Upwork deals in
the month before writing, recorded 26 September 2026. **Practitioner method with a named outcome and
no dataset**, so the taxonomy is the useful part and the claims stay claims.

### The branches of search terms

- **Tools.** Platform names a client types when they know what they run: Make, n8n, Zapier,
  Monday, HubSpot, Shopify, Salesforce, ClickUp, Zoho, Pipedrive, Google Calendar, Zoom, Gmail.
- **Positions and long-term work.** Titles rather than tools: GTM engineer, RevOps, AI consultant,
  email marketing expert. These postings look for a person, often for months, not for one workflow.
- **Generic problem words.** What a client writes when they know the pain and not the solution:
  automation, API integrations, business operations, client onboarding, no-code. Most people search
  only here, usually just "automation", which is not wrong and is also where the crowd is.
- **The client's industry, same logic.** A dental practice, a gym, a law firm, an HVAC company, a
  Shopify store, an agency, a clinic or a restaurant writes about its own trade, never about
  automation. The industry plus a word like "booking", "leads", "follow-up" or "no-shows" reaches
  those postings before any freelancer who only searched their own tool stack. A career changer owns
  this branch outright: the industry they already worked in is the one whose language they speak.

**The split inside the tools branch is the actual trick.** Low and no-code automation platforms
(Make, n8n, Zapier, and Claude Code to a degree) are where freelancers who do automation search for
themselves. Everything the client already runs (Shopify, Salesforce, Monday, Zoho, Google Calendar,
Gmail, and so on without end) is where nobody looks, and it is full of postings that are automation
work without saying so. The worked example from the source: a client posted about connecting
Shopify customers to his Google Calendar, with no mention of automation or any platform. The job
was a single Make workflow, and the client could not have known that before posting, which is
exactly why the posting sat in a search nobody else was running. So the rule for `/find-jobs`:
search the **client's** tools, not the member's. The member's own stack finds the crowded queries;
the client's stack finds the quiet ones.

**Which tools clients actually name.** A monthly scrape published through Maker School, August 2026:
2,391 unique postings mentioning Zapier, n8n, Make or Power Automate, and 3,636 in a broader
automation set, pulled with Apify and classified by keyword, so one posting can count under several
tools and the counts overlap. Shares of that set: **Zapier 1,070 (43.66%)**, **n8n 960 (39.17%)**
and rising each month since May, **Make 421 (17.18%)** and falling from 24.68% in May, Power
Automate 29, **GoHighLevel 600 (25.09%)**, generic CRM 1,037 (43.37%). Two scrape days failed and
were backfilled short, so the monthly total cannot be divided against July's to claim a decline, and
the publisher's two presentations disagree on the August per-weekday figure (88 against 92). A list
of tools worth searching, not a forecast.

### Judging the client, and where the source disagrees with our own data

The masterclass deliberately ignores reviews, total spend, payment verification and location,
arguing that clients who have spent nothing on Upwork have been its higher paying clients because
they do not know the platform's standard rates. It cares about two things only: that the reviews are
honest, and that the posting does not hard-cap itself with something like "$500 fixed price, done by
X day". A $6 average hourly spend may simply be an old assistant contract, not a ceiling.

**Our own connector measurement points the other way**, and neither side is measured: on 26
September 2026 the cheapest GoHighLevel postings we saw came from clients with no spending history
at all, while the $40 to $90 posting came from a client with $20,000 of history. One day, ten
postings, no more proof than the claim it argues with. What survives both: **do not disqualify a
client on thin signals**, and do disqualify a posting whose own text fixes a low budget and a
deadline. Record which kind of client actually paid, per the funnel rule in
[upwork-method.md](upwork-method.md), and let the member's own numbers settle it inside a few
months.

## What the work pays

### The published and the measured ranges

**Upwork's own page**, `upwork.com/resources/upwork-hourly-rates`, published 18 June 2025 although
titled for 2026, no update marker, so treat the age as unknown. **Asking rates from profiles, not
rates anybody was paid:** marketing automation consultants $40 to $90; chatbot developers $30 to
$61; CRM consultants $16 to $35, HubSpot $15 to $40, Salesforce $25 to $40; web developers $15 to
$50, web designers $15 to $30, WordPress $15 to $28, Webflow $20 to $45; SEO experts $15 to $35, SEO
analysts $25 to $50; AI developers $30 to $50, AI engineers $35 to $60, machine learning $50 to
$200. **Upwork publishes no rate page for Make, n8n, Zapier or GoHighLevel.** For those, use the
measurements below and say where they come from.
**Measured from real postings:** a third-party scrape with its method disclosed, 11,541 postings
over the 30 days to 16 May 2026 (Upwatcher). Keyword "ai automation", 707 hourly postings: **median
$30, lower quartile $20, upper quartile $40, ninth decile $60.** Platform-wide across 4,542 hourly
postings that stated a rate: **lower quartile $18, median $25, upper quartile $38, ninth decile
$55.** By the experience level the client picked, same source: entry level 216 postings **median
$18**, lower quartile $12; intermediate 2,708 postings **median $25**; expert 1,617 postings
**median $36**, upper quartile $48, ninth decile $70. Intermediate is 62% of all postings, **entry
level only 4.4%**. Of all postings 61% are hourly and 39% fixed, median fixed budget **$150**.

### Measured ourselves through the connector, 26 September 2026

Eleven searches, the ten newest postings per lane, sorted by recency. One day, not a distribution,
and `/find-jobs` can repeat it any time.
- **Fixed price, every posting stated a budget.** GoHighLevel median **$625** ($5 to $2,000), n8n
  **$160** ($10 to $3,500), chatbots **$75** ($20 to $4,750), WordPress **$57.50** ($10 to $550).
  Typical proposals 18 to 41.
- **Hourly, and here the postings go quiet.** n8n stated a rate in 5 of 10, chatbots 4 of 10,
  WordPress 8 of 10, GoHighLevel 8 of 10. Where a range exists the medians run **n8n $15 to $25**,
  **chatbots $25 to $42.50**, **WordPress $10 to $25**, **GoHighLevel $8 to $25**, with a single
  posting at $40 to $90.

**The entry-level filter is the finding that matters.** GoHighLevel filtered to entry level returns
a median of **$4 at the bottom of the range and $10 at the top**, and 5 of those 10 postings are
"more than six months": long-term work at $4 to $12 an hour. WordPress entry level looks the same,
4 of 10 long-term at a $12 median. Chatbots and n8n barely fill a page of entry-level work at all,
7 and 4 hits before the results ran out. The beginner lane is not a cheaper version of the same
market, it is a different market, and a member who enters it at $5 anchors themselves there for six
months. Better to enter an intermediate posting at the low end of its band than an entry-level
posting at the top of its. **Caveats from the same run.** The `expert` label says nothing about the
budget: a $5 fixed-price GoHighLevel posting and a $10 WordPress one both asked for experts.
Proposal counts reach 169 on a single $15 to $25 n8n job. Half the chatbot hourly results were voice
recording gigs from one client rather than development work, which pulls that median around. And
`total_spent` is missing for most clients in two of the lanes, so a client's history often cannot be
judged from a search row at all.

### Country: what the data says, and what it does not

**Upwork publishes no rates by the freelancer's country, and the chain everyone quotes is
circular.** The table naming $95 for North America, $85 for western Europe, $45 for eastern Europe,
$40 for the Middle East and Africa, $35 for Latin America and $25 for southern Asia appears in
Clockify citing Jobbers, in GigRadar citing Clockify, and in Upwatcher citing Jobbers, while the
Jobbers page is behind Cloudflare with no archived copy. Method unverifiable. Individual figures for
Cameroon or other African countries: nothing at all. The one survey with a described method,
Payoneer's freelancer insights across more than 2,000 freelancers in 122 countries, reports a
**global average of $21 to $22 an hour**, read through snippets rather than the original.
Peer-reviewed instead, and more useful: a fixed-effects logit over roughly 10,000 completed projects
on Freelancer.com found that **the asking rate is not a significant predictor of winning the job**,
while the client's rating of the freelancer and a **match between client and freelancer country**
are significant, and high cumulative prior earnings actually lower the chance of being hired
(Economies 11(3):80, data from September 2018). Another platform, eight years old, one study. So the
honest country advice is not "charge less where you live". It is: **apply where your country and
timezone match the client's**, the part with evidence behind it, and price against the discipline
and experience band above. On the related claim: Upwork says a rate far below market makes clients
assume lower quality and publishes nothing behind it, while the study above found no significant
rate effect in either direction. **No evidence that a low rate wins work, none that it loses it.**
Say that instead of repeating either camp.

### What an application costs

Upwork's own cut is 0 to 15 percent per contract, shown at proposal and offer
time. The flat 10 percent everyone still quotes is outdated, so read the fee on
the actual offer before quoting anyone a net figure (Maker School evidence
snapshot, 26 September 2026, source R14).

A Connect costs $0.15, sold in bundles, and Upwork states no range per job, only that it varies with
project size and demand. Blogs claim 2 to 6 Connects for a standard job; GigRadar, reading community
reports, claims 14 to 25, which would be $2.10 to $3.75, and more than 50 for a boost. Both
unverified, and `/pitch-page` reads the real `connects_cost` per job instead of guessing. From
133,872 agency proposals between December 2025 and February 2026 (GigRadar, a vendor with
automated agency accounts, not beginners): average reply rate 7.45%, **11.86% when the proposal went
out within 3 to 4 minutes** against 6.91% from minute five onward, and boosting with 21 to 30
Connects performed worse than not boosting. Their cost per hire works out near $60. **How many
people apply per job has no reliable number:** one scrape reports 86% of postings under five
proposals and calls that a scrape artifact itself, and the one measured figure, 9.41 bids per
project, is Freelancer.com in 2018.

### How to build a rate recommendation

Three inputs, in this order: the **discipline band** from Upwork's own page or the measured
distribution, the member's **experience level** as the client would pick it (entry median $18,
intermediate $25, expert $36), and their **verified proof**, which is what moves them up a band
rather than their ambition. Name the band, name where inside it you put them, name what would move
them up. Never invent a country discount, never round a measured median. Of roughly 55 sources
examined for this half, 14 survived; the rest was tool and agency content passing unsourced numbers
between each other, salary aggregators with no Upwork data, and community posts about price pressure
with no figures.
