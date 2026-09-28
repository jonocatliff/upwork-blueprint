# Lead magnet

Build a three-part SEO audit: how the business is found in Local Maps, how its
Google Business Profile builds trust, and how its website turns attention into an
enquiry. The output is a checked report for an existing Upwork conversation, with
no price, external contact route, calendar or unsupported claim in it.

## The run

Read `references/lead-magnet-language.md`, which is how every visible sentence
in the report has to read, then run:

```bash
python3 code/lead_magnet_build.py <job-id>
```

A saved business website is the only precondition; the audit runs at any stage. The
`/lead-magnet <job id> <website>` command saves that source through
`code/pipeline.py lead-magnet-source`. The audit resolves the exact Google
profile by its website and derives the city, country and map coordinate from that
confirmed profile. The member supplies a place ID only when more than one profile
uses the same website.

Three more measurements run alongside and none of them can fail the audit. The
opening hours are read from the rendered Google page when the profile source
returns an empty field, because empty means nobody knows, not that the business
keeps no hours. With `OPENAI_API_KEY` the report also says what the lowest reviews
complain about and whether AI search names the business at all; without the key
those two rows are left out, never filled with a zero.

The report remains at `jobs/<id>/lead-magnet.html` and is published automatically
to the stable URL saved as `lead_magnet_url`. Publication uses the same
pre-contract contact-details gate as a pitch page: it creates the link but never
adds it to a message or sends anything. If publication fails after a successful
build, the next run reuses that exact current report and retries only the free
Vercel step. Changing the website or exact profile clears the URL and requires a
fresh audit.

**An audit lives at `<job id>/audit`, a pitch page at `<job id>`.** Both are
published to the same project, so every deploy restages every page published
before it and lets each one pass its own gate again. A deploy that ships only the
new page takes every earlier link offline, and the saved URLs point at nothing.

The renderer uses the bundled React template in `templates/lead-magnet/src/`. It
carries the report's whole visual system, so a change there changes every report
you have ever sent. `src/main.tsx` hands it the data and Vite builds everything
into the single file `dist/index.html`.

**That built file stays self-contained.** It may carry images as data URIs and run
its own bundled script, but it makes no network request of any kind, and
`lead_magnet_check.py` refuses one that tries. Keep the illustrations, the
scorecard, the interactions and the visual system; the component structure is not
frozen, and a component the generator stops feeding is dead weight in every report.

After any template edit, rebuild the single-file runtime with:

```bash
cd templates/lead-magnet
npm ci
npm run build
```

For a public pitch-page preview, never reuse a client report. Generate the
fictional current-format example instead:

```bash
python3 code/lead_magnet_demo.py jobs/<id>/lead-magnet-example.html \
  --business "Example [industry]" --service "[client service]" \
  --location "[client market]" --conversion "[desired enquiry action]"
```

The demo uses no paid service, real client or external link. Match its fictional
business, service, market and conversion to the job's real industry; it exists
only so the pitch page can embed the real report experience safely.

## The cost and the preflight

Three spending limits stop a run before it starts, all fail-closed: Apify must
have at least 3 US dollars left against its monthly cap, DataForSEO at least 1,
and the review chapter refuses to begin when its share would pass 50 cents. None
is Upwork's rule; a misread budget should cost a stopped run, not an invoice.

The engine runs on the member's machine: every program the report needs is in
`code/`, nothing needs an account anyone else owns, and the keys come from the
member's own `.env`, with `~/.config/credentials.env` as the local fallback.
Firecrawl renders the website, Apify reads the exact public Google profile, and
DataForSEO serves search, competitors and the 25-point Local Maps grid. Any one
of `APIFY_API_TOKEN`, `APIFY_TOKEN` and `APIFY_API_TOKEN_PAID`
counts as the Apify key; the run needs one of the three, not a particular one.
PageSpeed is used when configured; otherwise local Lighthouse must be installed.
These calls cost money: the member-started command starts one run, and a failed
paid pull is never retried automatically.

Before the first paid call, the script runs a fail-closed preflight. It verifies
the required credentials, provider access, measurable Firecrawl credits, Apify
monthly-limit headroom, DataForSEO balance, the local browser runtime and the
Vercel destination. An unknown balance or failed connection stops the run.

On the first run, install missing local packages with `python3 -m pip install -r
requirements.txt`, followed by `python3 -m playwright install chromium`. Never
install anything or change credentials during an active paid run.

## What the report contains

The report answers three questions in this order:

1. **Google visibility:** a 25-point Local Maps grid for one verified generic service
   search, plus the businesses that lead that grid.
2. **Google Business Profile:** the exact public profile, including reviews, owner
   replies, categories, services, updates, photos, hours and booking data when available.
3. **Website:** the rendered website, its applicable enquiry elements, reachable
   pages and the official mobile Lighthouse categories.

The first view contains the business name, one overall conclusion, one overall
score and up to four evidenced quick fixes. The three audit sections start closed
and open in place, each showing its score, evidence source and one business
consequence. Supporting method and source limits sit in one disclosure at the end.

Use the warm paper, ink and amber report palette. Cards contain measured objects,
not paragraphs. Headings stay short and owner-facing. The report ends with
`Reply here on Upwork` and has no outbound link.

Scoring is reconstructible:

- Google visibility: checked grid points in the first three results divided by all
  checked points.
- Google Business Profile: good profile checks count 1, warnings 0.5 and failed checks 0.
- Website: applicable website elements found divided by applicable elements checked.
- Overall: the arithmetic mean of only the sections that were measured.

A missing input has no score. A completed check that finds nothing is zero.
The local report includes the pull date and states that rankings are a snapshot,
traffic estimates are not first-party analytics, and the website check covers
what a visitor can see rather than what happens after an enquiry.

Every score and sentence comes from the files produced in the same run. A missing
source stays visibly missing and leaves its score denominator. Never turn a failed
pull into a zero, choose between multiple business locations, or infer the
client's company from the Upwork job title.

## The thresholds

The audit separates observations from operating heuristics. Public source data
states what was found. The thresholds below help prioritise work, but they are
not Google requirements and do not prove that crossing a threshold causes more
calls or enquiries. Client-facing copy calls them the audit's operating benchmarks
or checks, and must not say Google requires them, that a threshold guarantees
rankings, or that one feature causes a specific uplift. The same values live in
`BENCHMARK` in `code/lead_magnet_search.py`; change both together.

Google Business Profile:

- Category capacity: the audit checks use a working ceiling of 10 categories.
- Photos: 10 is the minimum presence check and 100 is the audit target.
- Services: 30 is the audit baseline and 50 is its target.
- Description: 750 characters is treated as the field limit. The first 100
  characters are reviewed as the operating hook.
- Reviews: 20 reviews is a simple trust baseline. Recency and owner replies are
  reported separately.
- Booking, attributes, hours and updates are graded only when the exact public
  profile source returned those fields.

Website:

- Customer enquiry forms target at most four fields.
- Mobile largest contentful paint targets two seconds or less.
- A visible action, outcome-led button, trust proof and customer path are
  deterministic page checks, not conversion attribution.

## Five measuring rules, ported 27 September 2026

Five rules that cost nothing and prevent a wrong number, ported from the larger engine that
produces the same kind of report. These are measurement, not infrastructure.

**A missing value is not a zero.** DataForSEO answers `40102` when a grid point cannot be
measured. That point is reported as unmeasured, never as "not ranking". A report that turns an
outage into a finding is worse than a report with a gap in it.

**Count by the place, not by the name.** A business is matched on its Google CID, never on its
brand string. Two firms share a name more often than anyone expects, and a name match quietly
credits a competitor's ranking to your client.

**Zoom belongs to the radius.** A grid drawn for a five-kilometre radius uses a different zoom
than one for twenty, or the points sample the same block repeatedly and the map lies in the
client's favour. `--radius` is in kilometres, default 5.0, and `--zoom` is a separate flag the
collector does not set, so the two are matched by hand when either is changed.

**A refusal ends the run, it never picks another place.** When DataForSEO refuses
a location or a language, the next call is not the same question about a
neighbouring town or a country the endpoint happens to accept. The code stops
there on purpose; a helpful fallback would answer a question nobody asked and
bill for it. Locale comes from the endpoint's own list of what it serves, never
from the language the report is written in.

**Sibling terms travel together.** "Emergency plumber" and "plumber emergency" are one term for
a buyer and two rows in an export. They are counted once, and the report says which spellings
were folded.

## The hand pass before you send it

The scripts count what somebody thought to count, so a finding nobody wrote a template for never
appears. Six checks a script cannot do, on the rendered `jobs/<id>/lead-magnet.html`:

1. **Open their site yourself.** The home page and the two pages a buyer opens next. Write down at
   most two things a buyer would notice that no counter measures: a contact page in the wrong
   language, an offer you cannot work out from the home page, photography from a different kind of
   business. Only what is visible, the page is the evidence, and never a number. Every figure in the
   report comes from a pull, so an observation that needs a number is the wrong observation.
2. **Every figure carries the same value everywhere it appears.** The table, the prose and the
   summary each hold their own copy.
3. **No sentence describes what a visitor did, what a tool read, or what the owner knew.** None of
   that is visible from outside the business.
4. **No vendor name survives in the page.** `python3 code/lead_magnet_check.py` greps for them, so
   this one is checked for you.
5. **Read the whole page out loud.** Every sentence. Anything you would not say to this person on a
   call gets rewritten, not trimmed.
6. **Look at it at 1440 and at 390 pixels wide.** Broken images, console errors, horizontal
   overflow. A page that renders wide and overflows on a phone is not finished.

Then hand over one clickable line, never a file path.

When the report is finished, every line in it points at something on the live site or in a saved
response, and the checker re-reads the page rather than trusting the run that wrote it. A number
with no source, a section that survived from another client, or a claim the site itself
contradicts is a failure, not a rough edge.

When the member corrects or praises a report, ask whether the change should be
permanent. If yes, update this file for report decisions or the relevant
deterministic script for measurement logic. Save no client example in this repository.
