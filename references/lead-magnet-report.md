# Lead magnet audit contract

The report answers three questions in this order:

1. **Google visibility:** a 25-point Local Maps grid for one verified generic service
   search, plus the businesses that lead that grid.
2. **Google Business Profile:** the exact public Google Business Profile, including reviews,
   owner replies, categories, services, updates, photos, hours and booking data
   when available.
3. **Website:** the rendered website, its applicable enquiry elements,
   reachable pages and the official mobile Lighthouse categories.

The first view contains the business name, one overall conclusion, one overall
score and up to four evidenced quick fixes. The three audit sections start
closed and open in place. Each closed section shows its score, evidence source
and one business consequence. Supporting method and source limits sit in one
disclosure at the end.

Use the warm paper, ink and amber report palette. Cards contain
measured objects, not paragraphs. Keep headings short and owner-facing. The
report ends with `Reply here on Upwork` and has no outbound link.

Scoring is reconstructible:

- Google visibility: checked grid points in the first three results divided by all
  checked points.
- Google Business Profile: good profile checks count 1, warnings 0.5 and failed checks 0.
- Website: applicable website elements found divided by applicable
  elements checked.
- Overall: the arithmetic mean of only the sections that were measured.

A missing input has no score. A completed check that finds nothing is zero.
The local report includes the pull date and states that rankings are a snapshot,
traffic estimates are not first-party analytics, and the website check covers
what a visitor can see rather than what happens after an enquiry.

Thresholds and their limits live in `lead-magnet-benchmarks.md`. Report copy
must label them as operating heuristics, never Google requirements
or causal proof.

## It runs on your machine, and only yours

Every program the report needs is in `code/`. Nothing calls home, nothing needs an
account anyone else owns, and the keys are the ones in your own `.env`.
