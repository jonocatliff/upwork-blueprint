# Jobs: how we search, and what we propose

The operating half, state of 28 September 2026. `/find-jobs` reads the search strategy and the
client rules, `/context` the rate rule. Market statistics live in the report linked at the bottom,
which carries them with their sample sizes and caveats, because numbers copied here go stale.

## The four branches of search terms

Every term comes from one of these four, and a run that uses only one is a run in the crowd.

- **Tools.** Platform names a client types when they know what they run: Make, n8n, Zapier, Monday,
  HubSpot, Shopify, Salesforce, ClickUp, Zoho, Pipedrive, GoHighLevel, Google Calendar, Zoom,
  Gmail, WordPress.
- **Positions and long-term work.** Titles rather than tools: GTM engineer, RevOps, AI consultant,
  email marketing expert. These postings look for a person, often for months, not for one workflow.
- **Generic problem words.** What a client writes when they know the pain and not the solution:
  automation, API integrations, business operations, client onboarding, no-code. Most freelancers
  search only here, usually just "automation", which is not wrong and is also where the crowd is.
- **The client's industry, same logic.** A dental practice, a gym, a law firm, an HVAC company, a
  Shopify store or a clinic writes about its own trade, never about automation. The industry plus
  "booking", "leads", "follow-up" or "no-shows" reaches those postings before any freelancer who
  searched only their own tool stack. A career changer owns this branch: the industry they already
  worked in is the one whose language they speak.

**The split inside the tools branch is the actual trick.** The low and no-code platforms (Make,
n8n, Zapier) are where freelancers who do automation search for themselves. Everything the client
already runs (Shopify, Salesforce, Monday, Zoho, GoHighLevel, Google Calendar, Gmail) is where
nobody looks, and it is full of postings that are automation work without saying so. One client
posted about connecting his Shopify customers to his Google Calendar, naming no platform and no
automation; the job was a single Make workflow, and it sat in a search nobody was running.
**Search the client's tools, not the member's.** The member's own stack finds the crowded queries,
the client's stack the quiet ones. Zapier and n8n lead the postings by a distance, n8n rising and
Make falling through 2026, Power Automate barely present, while GoHighLevel and generic CRM wording
carry a quarter to nearly half of the automation set alone. Current shares are in the report.

## Judging the client

Three signals, from the search row and then from `find_jobs` action `get`:

1. **Verified payment.** Every search sets `verified_payment_only` true. An unverified client
   cannot pay without clearing verification first, so this is the one hard gate.
2. **History.** `total_spent`, `total_posted_jobs` and `client_record` say whether they hired before
   and how they rated those hires. `total_spent` is missing from most search rows, so judge it on
   the job page or not at all.
3. **Hire rate.** Jobs posted against hires made, from `client_record`. A client who posts
   constantly and hires rarely is a warning, not a veto. Confidence: unmeasured, folklore.

**Do not disqualify a client on thin signals.** A low average hourly spend may be one old assistant
contract, not a ceiling, and zero spend may be a client who does not know the platform's rates.
**Do disqualify a posting whose own text caps itself**, for example "$500 fixed price, done by
Friday": the posting is evidence about the budget, the history only evidence about the client.
Record which kind of client actually paid, and let the member's own numbers settle it
within months rather than a rule written here.

## How to propose an hourly rate

Three inputs, in this order: the **discipline band**, taken from Upwork's rate page or the monthly
report and never from memory; the **experience level a client would pick**, entry, intermediate or
expert, which is what moves the band; and the member's **verified proof**, which is what moves them
up a level, rather than their ambition. Name the band, name where inside it the member sits, name
what would move them up.
**Never talk a member down to compete:** there is no evidence that a low rate wins work and none
that it loses it. Never invent a country discount; what has evidence behind it is applying where
the member's country and timezone match the client's. Never round a measured median. Avoid the
entry-level lane even for a first job: it is a different market at roughly $4 to $12 an hour, often
on contracts past six months, and it anchors a member there. The low end of an intermediate band
beats the top of an entry-level one.

## What an application costs

A Connect costs **$0.15**, sold in bundles. Upwork publishes no range of Connects per job, only
that it varies with project size and demand, so **the real per-job cost is read from the
connector's `connects_cost`, never estimated**. Say what an application costs and what is left.
**Upwork's own cut is 0 to 15 percent per contract**, shown at proposal and offer time; the flat 10
percent everyone quotes is outdated, so read the fee on the offer before quoting a net figure.

## Where the numbers come from

Anyone who needs a current figure reads it there and cites the date, never taking it from here:

- **The monthly posting report:** `upwork.redwaterrev.com/report/2026-08`, rate distribution, tool
  shares, and the publisher's own caveats.
- **Upwork's asking rates by discipline:** `upwork.com/resources/upwork-hourly-rates`.
- **What we checked and what did not hold:** [RESEARCH.md](../RESEARCH.md).
