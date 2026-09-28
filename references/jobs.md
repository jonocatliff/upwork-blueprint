# Jobs: how we search, and what we propose

The operating half, state of 28 September 2026. `/find-jobs` reads the search strategy and the
client rules. Market figures are not copied here, because a number copied goes stale and nobody
notices; the two pages at the bottom carry them with their sample sizes and caveats.

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

## Ready-made tracks

A first run does not have to invent terms from nothing. Two lanes are written out below, each
already split across the four branches. Offer the matching lane, let the member cut what they
cannot deliver, and treat the rest as the exploration set: the ones that produce nothing twice
still get dropped.

**Lane A, getting found and getting enquiries.** SEO, Google Ads and the website that carries
them. One buyer, a local business owner who wants the phone to ring, and the lane this repo
already delivers for: the lead magnet is a local SEO audit and both roadmap templates are SEO
and Google Ads.

```
- Local SEO: Google Business Profile · Google Maps ranking · local SEO
- SEO problem: not showing on Google · organic traffic · keyword research
- Google Ads: Google Ads · Performance Max · conversion tracking
- Ads problem: wasted ad spend · cost per lead · Google Ads audit
- Website: Webflow · WordPress · Elementor · landing page
- Industry: dentist SEO · plumber leads · law firm marketing · med spa ads
```

**Lane B, what happens to an enquiry after it arrives.** CRM, follow-up and booking, sold to
agencies and to owners who already have traffic. A different promise from lane A, so it is a
lane of its own rather than three more terms.

```
- GoHighLevel: GoHighLevel · GHL · HighLevel snapshot
- CRM problem: missed call text back · appointment booking · CRM setup
- Role: GoHighLevel expert · marketing automation specialist
```

**One lane at a time.** Every track is one search call per page, so six tracks cost twelve of a
run's roughly two dozen calls. Two lanes at once buys twice the coverage at half the depth per
term, which is how a run stops finding the fresh postings that are the whole point. The rotating
slot for a new candidate term is the place to test across lanes, not a second lane.

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

## Where the numbers come from

Anyone who needs a current figure reads it there and cites the date, never taking it from here:

- **The monthly posting report:** `upwork.redwaterrev.com/report/2026-08`, rate distribution, tool
  shares, and the publisher's own caveats.
- **Upwork's asking rates by discipline:** `upwork.com/resources/upwork-hourly-rates`.
- **What we checked and what did not hold:** [RESEARCH.md](../RESEARCH.md).
