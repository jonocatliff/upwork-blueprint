---
description: Builds the local SEO audit for an active Upwork conversation from live website, profile, search and map evidence.
argument-hint: "<job id> <website>"
---

# /lead-magnet

Follow `references/lead-magnet.md`. Nothing in this command talks to
Upwork or sends a message. A successful run publishes the checked audit.

ROADMAP

1. Check the website, resolve its exact Google profile, then verify providers, balances and Vercel.
2. Measure the rendered website, search visibility and 25-point Maps grid, plus
   what the lowest reviews complain about and whether AI search names the
   business. The last two need `OPENAI_API_KEY`; without it the report leaves
   them out rather than printing a zero, and nothing else changes.
3. Build, validate, publish and open the audit for review.

This normally takes several minutes. The website, Apify and DataForSEO can fail
or refuse a budget limit. A failed paid pull is held for review and never retried
automatically.

**A website is the only precondition.** The audit runs in any pipeline stage: a
business that sends its site gets the audit whether the lead just appeared, has
replied, or is already in conversation. There is no stage to reach first.

If a website is given, save it with
`python3 code/pipeline.py lead-magnet-source <job id> <website>`. If none is
given and none is saved, ask for it and stop.

Run `python3 code/lead_magnet_build.py <job id>`. Its first
live step is the fail-closed preflight; never bypass it. `--dry-run` names every
paid service the run would call and writes nothing: it is the only way to inspect
an audit before it costs anything, and it is worth one minute when a client's
details were entered by hand.

Then check the page against the business it was built for:
`python3 code/lead_magnet_check.py jobs/<id>/lead-magnet.html "<business name>"`.
The name matters. Without it the check still passes a report left over from
another run, and sending one client another client's audit ends the lead and the
reputation with it.

Then open the public audit and inspect the complete page. Finish with the compact completion report
from `CLAUDE.md`. Link the public audit, name missing evidence, give the next
step `/brief <job id>` (it drafts the message that shares the audit link), and
end with `Upwork calls: 0`.
