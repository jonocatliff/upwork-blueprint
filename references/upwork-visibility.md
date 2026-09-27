# Being found on Upwork: what is documented, and what is sold as advice

Where a profile appears and why. Every line says where it comes from, because
almost everything written about Upwork's search is sold by someone with a tool to
sell. Sources read 26 September 2026; Upwork's help pages carry no date.

## How clients actually search, documented

The search bar takes keywords, job titles or a freelancer's name, and Advanced
Search adds the filters: their own network and past hires, **talent quality**
(the badges), hourly rate, location, timezone, US-only, freelancer or agency,
contract-to-hire, skills, languages and **"available now"**. Recommendations run
separately through Discover.
([Search for talent](https://support.upwork.com/hc/en-us/articles/17935950691347--Search-for-talent),
[Find freelancers](https://support.upwork.com/hc/en-us/articles/211063528-Find-Freelancers-and-Agencies))

What decides whether a profile turns up is a boolean match against the profile
text: all of these words, any of these words, an exact phrase, exclusions.
AND, OR and NOT only work in capitals; `+`, `-` and `!` do nothing. **"Title
search" matches the profile title alone**, so a title missing the client's words
drops out of that search completely.
([Advanced search](https://support.upwork.com/hc/en-us/articles/17935726681875--Use-advanced-search-techniques-to-find-talent))

Matching fields beyond the text: categories and skills. Both are ANDed filters, so
a slot left empty is a search a member never appears in. Upwork contradicts itself
on how many of each are allowed; the counts and their sources live once, in
[profile-blueprint.md](profile-blueprint.md), because that is the file the profile
commands read. Fill what the live editor offers and claim no number from memory.

## Every filter a client can actually apply

Read off the connector's own `find_freelancers` description on 26 September 2026, which
mirrors the talent search page. A client can narrow by: badge (Top Rated, Top Rated
Plus, Rising Talent, and Expert-Vetted on a Business Plus plan), Job Success Score with
80 and 90 as the presets, hourly rate range, total earned range **and explicitly "no
earnings yet"**, hours billed, completed jobs, country, state, continent, UN subregion,
Upwork timezone label, languages, English level from basic to native, contract-to-hire,
offers consultations, and the paid Available Now badge.

Two things follow for the profile. **Every one of those fields is a gate**, so an empty
English level or a missing timezone is not untidiness, it is a filter the member fails
silently. And a client can deliberately filter **for** freelancers with no earnings,
which is the only documented way a beginner is easier to find rather than harder.

The same description says a boosted row is a paid ad placement and carries the rank it
would have held unpaid, and that Available Now is a badge the freelancer buys, not a
verified state. Neither is a signal of quality.

## Ranking: one admitted lever, and a refusal

Upwork will not explain the ranking, and says so: revealing it "could make it
easier for some users to artificially boost their rankings". It names only
platform-generated data such as completed projects and client feedback, plus the
freelancer's own service descriptions.

The one lever it states plainly: **"A complete profile increases your ranking in
Upwork search results"**
([Build a 100% complete profile](https://support.upwork.com/hc/en-us/articles/34924882793107-Build-a-100-complete-profile)).

Documented absence, which matters as much: the old help article on how profiles
are ranked now returns 404, the Job Success Score pages never mention search at
all, and response rate, activity and hourly rate appear nowhere as ranking
signals. A vendor blog naming seven exact signals from "730,200 job posts"
publishes no method and sells its own tooling; treat it as advertising. The
popular claim that profiles rotate through the results appears only in community
threads, never in a moderator answer.

Job Success Score's only documented consequence: below 79% "you may find it
difficult to connect with new clients"
([Job Success Score](https://support.upwork.com/hc/en-us/articles/211068358-Job-Success-Score)).

## Boost and the availability badge, and what a real test showed

**Boosted profile** is a pay-per-click auction. The bid in Connects per click
plus relevance decides the promoted slot, and a click, save, invite, hire or
video view is billed, at most once per client per job post, inside a daily and
total cap.
([How to boost](https://support.upwork.com/hc/en-us/articles/20850487528723-How-to-boost-your-profile))
Upwork's own promise stays vague, "may help you gain increased visibility", with
no number for profiles. The 24% figure that circulates belongs to boosted
**proposals**, not profiles.

**Availability badge** costs Connects weekly at a price that moves with demand,
and Upwork claims it "can increase job invites by up to 70%", while indexed
snippets of the same page still say 50%: a marketing number, not a measurement.
It explicitly does **not** change search position
([FAQ](https://support.upwork.com/hc/en-us/articles/40368040805907-Does-this-increase-my-visibility-to-clients-Will-I-appear-higher-in-search-results)).

The only measured test found: Morgan Overholt, 30 proposals, April 2024. Baseline
50% proposal views, 20% replies, 10% hires. The badge week **dropped** views to
20%. Boosted proposals reached 80% views for $32.70 in Connects across ten
applications. Boosted profile produced a minimal change and zero invites.
([Are Upwork's paid features worth it](https://morganoverholt.com/upwork/upwork-paid-features/))
One person, 30 data points, two years old: indicative, not transferable.

## Specialized profiles are gone

Removed 28 May 2026. Their titles, overviews and skills were deleted and cannot
be recovered. Upwork states search visibility and rankings are unchanged, and the
single profile now surfaces whichever work history, portfolio item and skills fit
the query.
([Update to Specialized Profiles](https://support.upwork.com/hc/en-us/articles/115013750068-Update-to-Specialized-Profiles-What-to-know))
Blog posts arguing that this made "profile dilution" the new gatekeeper
contradict Upwork directly, and neither side has measured anything.

## What this means for the Blueprint

Chase completeness and the words a client types, because those are the only two
levers with a documented effect. Treat paid visibility as an experiment with the
member's money, never as a step in the course. And when a command repeats any
claim from this file, it says where the claim comes from, exactly as this file
does.
