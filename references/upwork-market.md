# What the work pays, and how to price against it

The numbers behind a rate recommendation. Each one carries its source and its
weight, because the most quoted rate table on the internet turns out to cite
itself. Read 26 September 2026.

## Upwork's own published ranges

From `upwork.com/resources/upwork-hourly-rates`, published 18 June 2025 although the
page is titled for 2026, with no update marker, so treat the age as unknown. These
are **asking rates from profiles, not rates anybody was paid**:

- Marketing automation consultants $40 to $90
- Chatbot developers $30 to $61
- CRM consultants $16 to $35, HubSpot $15 to $40, Salesforce $25 to $40
- Web developers $15 to $50, web designers $15 to $30, WordPress $15 to $28,
  Webflow $20 to $45
- SEO experts $15 to $35, SEO analysts $25 to $50
- AI developers $30 to $50, AI engineers $35 to $60, machine learning $50 to $200

**Upwork publishes no rate page for Make, n8n, Zapier or GoHighLevel.** For those,
use the measurements below and say where they come from.

## Measured from real postings

A third-party scrape with its method disclosed, 11,541 postings over the 30 days to
16 May 2026 (Upwatcher). Keyword "ai automation", 707 hourly postings: **median $30,
lower quartile $20, upper quartile $40, ninth decile $60.** Platform-wide across
4,542 hourly postings that stated a rate: **lower quartile $18, median $25, upper
quartile $38, ninth decile $55.**

By the experience level the client picked, same source: entry level 216 postings,
**median $18**, lower quartile $12. Intermediate 2,708 postings, **median $25**.
Expert 1,617 postings, **median $36**, upper quartile $48, ninth decile $70.
Intermediate is 62% of all postings; **entry level is only 4.4%**.

## Measured ourselves through the connector, 26 September 2026

Eleven searches, the ten newest postings per lane, sorted by recency. A snapshot of
one day, not a distribution, and `/find-jobs` can repeat it any time.

**Fixed price, every posting stated a budget.** GoHighLevel median **$625** ($5 to
$2,000). n8n median **$160** ($10 to $3,500). Chatbots median **$75** ($20 to
$4,750). WordPress median **$57.50** ($10 to $550). Typical proposals 18 to 41.

**Hourly, and here the postings go quiet:** n8n stated a rate in 5 of 10, chatbots
in 4 of 10, WordPress in 8 of 10, GoHighLevel in 8 of 10. Where a range exists, the
medians run **n8n $15 to $25**, **chatbots $25 to $42.50**, **WordPress $10 to $25**,
**GoHighLevel $8 to $25** with a single posting at $40 to $90.

**The entry-level filter is the finding that matters.** Filtering GoHighLevel to
entry level returns rates with a median of **$4 at the bottom and $10 at the top**,
and 5 of those 10 postings are "more than six months": long-term work at $4 to $12
an hour. WordPress entry level looks the same, 4 of 10 long-term at a $12 median.
Chatbots and n8n barely fill a page of entry-level work at all, 7 and 4 hits before
the results ran out.

So the beginner lane on Upwork is not a cheaper version of the same market, it is a
different market, and a member who enters it at $5 anchors themselves there for six
months. Better to enter an intermediate posting at the low end of its band than an
entry-level posting at the top of its.

**Caveats from the same run.** The `expert` label says nothing about the budget: a
$5 fixed-price GoHighLevel posting and a $10 WordPress one both asked for experts.
Proposal counts reach 169 on a single $15 to $25 n8n job. Half the chatbot hourly
results were voice recording gigs from one client rather than development work,
which pulls that median around. And `total_spent` is missing for most clients in two
of the lanes, so a client's history often cannot be judged from a search row at all.

**Fixed price against hourly:** 61% of postings are hourly, 39% fixed, and the
median fixed budget is **$150**. The distribution is bottom-heavy: 1,728 postings
under $100, 1,337 from $100 to $500, 474 to $1,000, 767 to $5,000, 139 to $10,000,
89 to $50,000, 17 above.

## The August 2026 automation market, with its own caveats

A monthly scrape published through Maker School, August 2026: 2,391 unique postings
mentioning Zapier, n8n, Make or Power Automate, and 3,636 in a broader automation
set. Jobs were pulled with Apify and classified by keyword, so one posting can count
under several tools and the counts overlap.

Rates there are **posted hourly maxima, not agreed rates**: across 928 postings that
stated one, the median is **$32.50**, the mean $36.91, the quartiles **$18.25 and
$50**. Postings below $25 were 35.2%, up from 30.9% in July. Only 78 postings, 3.26%,
asked above $75, nine above $150, and the highest was $250. Fixed price was 37.1% of
postings, down from 42.9% in May.

Tool mentions, as shares of that set: **Zapier 1,070 (43.66%)**, **n8n 960 (39.17%)**
and rising each month since May, **Make 421 (17.18%)** and falling from 24.68% in
May, Power Automate 29. **GoHighLevel appears in 600 postings (25.09%)** and generic
CRM in 1,037 (43.37%).

The publisher's own caveats matter as much as the numbers: two scrape days failed and
were backfilled short, so the monthly total cannot be divided against July's to claim
a decline, and the publisher's two presentations disagree on the August per-weekday
figure (88 against 92). Read this as a list of buyer problems and tools worth
investigating, not as a forecast.

## Country: what the data says, and what it does not

**Upwork publishes no rates by the freelancer's country, and the chain everyone
quotes is circular.** The table naming $95 for North America, $85 for western
Europe, $45 for eastern Europe, $40 for the Middle East and Africa, $35 for Latin
America and $25 for southern Asia appears in Clockify citing Jobbers, in GigRadar
citing Clockify, and in Upwatcher citing Jobbers, while the Jobbers page is behind
Cloudflare with no archived copy. Method unverifiable. Individual figures for
Cameroon or other African countries: nothing at all.

The one survey with a described method, Payoneer's freelancer insights across more
than 2,000 freelancers in 122 countries, reports a **global average of $21 to $22
an hour**, read through snippets rather than the original.

What is peer-reviewed instead, and more useful: a fixed-effects logit over roughly
10,000 completed projects on Freelancer.com found that **the asking rate is not a
significant predictor of winning the job**, while the client's rating of the
freelancer and a **match between client and freelancer country** are significant,
and high cumulative prior earnings actually lower the chance of being hired
(Economies 11(3):80, data from September 2018). Another platform, eight years old,
one study.

So the honest country advice is not "charge less where you live". It is: **apply
where your country and timezone match the client's**, because that is the part with
evidence behind it, and price against the discipline and experience band above.

## Does a low rate cost you work

Upwork claims a rate far below market makes clients assume lower quality, and
publishes nothing behind that claim. The study above found no significant effect of
the asking rate in either direction. **There is no evidence that a low rate wins
work, and none that it loses it.** Say that plainly instead of repeating either
camp.

## Connects and what an application costs

A Connect costs $0.15, sold in bundles, and Upwork states no range per job, only
that it varies with project size and demand. Blogs claim 2 to 6 Connects for a
standard job; GigRadar, reading community reports, claims 14 to 25, which would be
$2.10 to $3.75, and more than 50 for a boost. Both unverified, and our own
`/pitch-page` reads the real `connects_cost` per job instead of guessing.

From 133,872 agency proposals between December 2025 and February 2026 (GigRadar,
a vendor with automated agency accounts, not beginners): an average reply rate of
7.45%, 11.86% when the proposal went out within 3 to 4 minutes against 6.91% from
minute five onward, and boosting with 21 to 30 Connects performed worse than not
boosting. Their cost per hire works out near $60.

**How many people apply per job has no reliable number.** One scrape reports 86% of
postings under five proposals and calls that a scrape artifact itself; the one
measured figure, 9.41 bids per project, is Freelancer.com in 2018.

## How to build a recommendation from this

Three inputs, in this order: the **discipline band** from Upwork's own page or the
measured distribution, the member's **experience level** as the client would pick it
(entry median $18, intermediate $25, expert $36), and their **verified proof**, which
is what moves them up a band rather than their ambition. Name the band, name where
inside it you put them, and name what would move them up. Never invent a country
discount, and never round a measured median.

Of roughly 55 sources examined for this file, 14 survived. The rest was tool and
agency content passing unsourced numbers between each other, salary aggregators
with no Upwork data, and community posts about price pressure with no figures.
