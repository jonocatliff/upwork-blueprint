---
description: Builds the local SEO audit for an active Upwork conversation from live website, profile, search and map evidence.
argument-hint: "<job id> <website>"
---

# /lead-magnet

Follow `references/lead-magnet.md`. Nothing here talks to Upwork or sends a
message. Review the local audit before publishing it.

ROADMAP

1. Check the website, resolve its exact Google profile, then verify providers, balances and Vercel.
2. Measure the rendered website, search visibility and 25-point Maps grid, plus
   what the lowest reviews complain about and whether AI search names the
   business. The last two need `OPENAI_API_KEY`; without it the report leaves
   them out rather than printing a zero, and nothing else changes.
3. Build, check the business name and hand pass locally, then publish the audit.

This normally takes several minutes. The website, Apify and DataForSEO can fail
or refuse a budget limit. A failed paid pull is held for review and never retried
automatically.

**A website is the only precondition.** The audit runs in any pipeline stage: a
business that sends its site gets the audit whether the lead just appeared, has
replied, or is already in conversation. There is no stage to reach first.

If a website is given, save it with
`python3 code/pipeline.py lead-magnet-source <job id> <website>`. If none is
given and none is saved, ask for it and stop.

Say one cost line: about $0.25 for the core audit, measured on a past run;
optional chapters add cost. Ask for an explicit yes before the first paid call.
Then run `python3 code/lead_magnet_build.py <job id>`; never bypass its preflight.
`--dry-run` names the paid services and writes nothing. A current local report is reused.

Then check the page against the business it was built for:
`python3 code/lead_magnet_check.py jobs/<id>/lead-magnet.html "<business name>"`.
The name matters. Without it the check still passes a report left over from
another run, and sending one client another client's audit ends the lead and the
reputation with it.

Open the local audit and complete the hand pass in `references/lead-magnet.md`.
Only then run `python3 code/lead_magnet_deploy.py <job id>` and open its public URL.
Finish with the compact report from `CLAUDE.md`. Link the audit, name missing evidence, give the next
step `/brief <job id>` (it drafts the message that shares the audit link), and
end with `Upwork calls: 0`.
