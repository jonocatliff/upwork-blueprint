# Upwork: what is allowed, and what the connector can do

The single source for every command in this repo that talks to Upwork. The two halves below answer two different questions that arrive in the same moment ("can I automate this?"): the first says what you may do, the second says what the tool gives you. **Technically possible is not the same as permitted.** Commands link here instead of restating any of it.

Numbers carry their source and their date. Whoever changes one names the source next to it. Whoever hits a new limit in real use writes it down here, with the actual call and the actual response, not the assumption about it.

---

## What is allowed

Measured 14 August 2026 from Upwork's own pages, not from blogs.

### The hard line

**Unattended automation is prohibited.** Upwork names these verbatim as grounds for enforcement:

> "Using OAuth2 tokens or session cookies from a browser or **an official client** in a script or bot"
> "Exceeding rate limits or **running background polling that resembles scraping**"

Source: [Use bots and other automation properly](https://support.upwork.com/hc/en-us/articles/43342677368467-Use-bots-and-other-automation-properly)

Two approaches that would technically work are therefore out: copying your Claude Code login into another runner (a cron job, a hosted agent, a credential vault), and polling on a schedule.

**The Blueprint's conservative route:** use the official connector only in a member-started local run, keep calls narrow and put a specific approval in front of every write. This removes the unattended pattern named in the policy. It is not evidence that Upwork has reviewed or approved this repository or every connector action.

### The numbers

- **Requests per IP:** 10 per second, then HTTP 429. [Support](https://support.upwork.com/hc/en-us/articles/115015933428-What-are-the-API-requests-limits)
- **Requests per IP:** 300 per minute. [Developer docs](https://www.upwork.com/developer/documentation/graphql/api/docs/index.html)
- **Requests per day:** 40,000, confirmed in the API-key application. [API key](https://support.upwork.com/hc/en-us/articles/115015857647-Request-an-API-key)
- **Caching API responses:** 24 hours maximum. Both sources above.

The first two contradict each other and both are Upwork's. Assume the stricter one. Compare the exact call count from a run with both published limits instead of declaring it safe from an estimated range.

**The pattern matters as much as volume.** "Polling that resembles scraping" is a behavioural judgement with no documented threshold. No request count makes unattended polling acceptable. Member initiation is a house rule that avoids that pattern, not a blanket compliance guarantee.

### The house rules, stricter than the terms

1. **The member sends every message on Upwork.** The Blueprint never calls `send_message` and never creates a proposal with `manage_proposals`. `/brief` writes drafts; the member copies one from the cockpit panel and sends it in the Upwork conversation.
2. **Reading runs on demand.** A command you typed in Claude Code. No timer, no background job.
3. **Every run reports its call count.** One sentence. Then "well under the limit" is measured rather than assumed.
4. **`python3 code/pipeline.py prune` after each run.** Upwork content older than 24 hours goes. Your own scores, notes and history are yours and stay.
5. **No login leaves this machine.** Not into a vault, a cron job or a hosted agent.
6. **Never buy Connects.** Commands say what an application costs and what is left. Buying is your click on Upwork.

### Links before a contract starts

Checked 12 September 2026 against Upwork's help center, as quoted by the search index (the pages block direct fetching):

- **Contact information is banned until the contract starts.** Sharing it, or asking for it, "before a contract starts is against our Terms of Service, and may result in temporary restrictions, loss of talent badges, or permanent loss of account access." Contact information means any way to reach you outside Upwork. [Keeping your contact information safe](https://support.upwork.com/hc/en-us/articles/360051749534-How-to-keep-your-contact-information-safe-on-Upwork)
- **A link to your work is allowed.** "You can share website portfolio links with potential clients, but just be sure to ask the client to only contact you through Upwork until the contract starts." Same article.
- **So a linked page must carry no way to reach you.** No email, phone, WhatsApp, booking link, contact form or social profile. Every page this repo builds for a client before a contract, including pitch pages and automatically published SEO audits, follows that and says "reply here on Upwork" instead. Publishing creates the link; it never sends it.
- **Meetings run on Upwork's own video calls** until the contract starts. [Can I share my own communication tools?](https://support.upwork.com/hc/en-us/articles/40444093133331-Can-I-share-my-own-communication-tools-like-email-or-meeting-links)
- **Exception:** if you or the client is on an Enterprise plan, contact details may be shared before a contract.

### API eligibility does not settle automation permission

Upwork's API-key application lists these eligibility criteria:

- $25,000 lifetime earnings
- Job Success Score of 90% or higher
- Identity verified, payment method, profile photo, account in good standing

Plus: *"Upwork API is available for personal and internal use only. Commercial use isn't supported."* This repo hosts nothing and holds no one's login: every member uses the official connector in their own Claude Code, for their own account.

Meeting those criteria may make an account eligible to apply for a key. It does not by itself authorize unattended automation, commercial use or any particular write. This Blueprint remains local and member-started regardless of earnings.

### The open contradiction, stated rather than resolved

The connector's tool description exposes a `set_tool_permission` switch with an `always_allow` value and calls it useful for automated flows. That describes a technical permission setting, not Upwork policy approval for unattended use.

Two Upwork sources, two directions. This file does not resolve that, because it cannot. If you intend to run anything unattended, ask Upwork support directly and write their answer here.

### An open compliance question about this very Blueprint

Upwork's own guidance on the connector asks a member to check with support before scheduled activity, AI filtering or scoring of results, storing connector output, hosted clients, or chaining several tools into one flow. **Two of those describe what this Blueprint does:** `/find-jobs` scores postings with a model, and `pipeline.py` stores connector output in `data/jobs.json`. A human starts every run and nothing is scheduled, which is the part we were careful about. The rest is unanswered, and it is the member's own question to put to Upwork support before distribution. Recorded 26 September 2026 from the Maker School evidence snapshot, source R21.

---

## What the connector can do

**Reading is broadly measured. Writing is narrow and must be checked at run time.** Everything under a MEASURED heading was called against a real account and produced the response described, with its date. Everything under DOCUMENTED BUT UNTESTED comes from the connector's own tool description and has not been exercised. A documented action is not a measured capability.

### How a command calls it

Every command that calls Upwork takes the smallest in-scope route below.

#### Before the first call

Read the "What is allowed" half and the relevant section below. Read the matching `.claude/commands/<name>.md` when a command owns the workflow. State the planned call budget before calling Upwork.

Use fresh local state first. A cached response less than 24 hours old can answer the same question without another call. Never treat an empty status-filtered proposal response as proof that nothing exists.

#### Choose the narrow route

- Job discovery: `find_jobs search` or `smart_search`; page only until the stated time window or enough candidates are covered.
- Full job facts: `find_jobs get` for one opened or shortlisted job, never a list.
- Profile: `get_profile`; use `list_highlights` only when portfolio or certificates matter.
- Pipeline state: proposal, offer and contract list calls once per required first page. Use `get_room` only for pipeline jobs that can have a client reply.
- Messages: `list_rooms` once for waiting state, then `list_messages` only for the rooms being reviewed.

Stop when the requested fact is known. Do not broaden a search to make an empty result look productive. Report any connector behavior that is still untested as untested.

#### Gate writes

Every write needs approval for the exact action and content. Profile previews remain unconfirmed until the member explicitly approves them. Proposal previews are never confirmed by this Blueprint: the member reviews the prepared fields and submits the proposal on Upwork themselves. House rule 1 above applies: the member sends every message.

Write pipeline state only through `python3 code/pipeline.py`. After the operation, run the prune from house rule 4 and report the exact Upwork call count.

### MEASURED 14 August 2026: reading a profile

- **`get_profile` action `get`, no key:** your own profile. Title, full overview text, skills, languages and proficiency, education, employment history, hourly rate, `profileAggregates` (earnings, job counts, feedback count), location, availability, profile URL.
- **`get_profile` action `get` with a `profile_key`** (starts with `~`): another freelancer's public profile. Used to analyse three top earners. **Measured again 12 September 2026:** the fields sit under `data.talentProfileByProfileKey` instead of `data`, and `profileAggregates` adds the badge (`top_rated`), the earnings bucket ("$100K+") and `totalFeedback`. The key comes from any public profile URL, `upwork.com/freelancers/~0...`, which a web search for the profession returns without touching Upwork.
- **`get_profile` action `list_highlights`:** portfolio projects (id and title) and certificates. Titles only, no contents.
- **`get_profile` actions `transactions` and `connects_balance`:** present, untested.

**Not in the profile response** (the public profile page is the only source): Job Success Score, client review texts, billed hours, portfolio contents, **intro video** (there is no field for one, which says nothing about whether a video exists). The review **count** is there: `profileAggregates.totalFeedback`.

**MEASURED 12 September 2026:** `get_freelancer_dashboard` and `list_contracts` action `search` carry no Job Success Score either. The dashboard does show Connects spending line by line, which is how a recurring "Paid invitation badge" charge of one Connect every twelve hours became visible.

### Writing a profile: the limit moved

**MEASURED 14 August 2026:** `update_profile` wrote only availability, employment, languages, education and other experience.

**DOCUMENTED BUT UNTESTED, tool description 12 September 2026:** `update_profile` now also has `update_title` (70 characters at most), `update_overview` (5,000 characters at most) and `set_skills` (the complete set, 20 at most, names resolved to Upwork's skill list, custom skills rejected). **Still not writable: hourly rate, portfolio, video.** Every write returns a preview first and runs only through `confirm_preview` after an explicit yes. The first real run moves this section to measured.

### DOCUMENTED BUT UNTESTED, tool description 12 September 2026: profile boosters

`boost_profile` action `get_status` reads the Availability Badge (the "Available Now" badge, a recurring weekly Connects charge that shows up as "Paid invitation badge" in the Connects history) and any profile boost ad. `toggle_availability_badge` with `enabled: false` switches the badge off; switching it on or starting ads is only possible on upwork.com.

### Proposals

**DOCUMENTED BUT UNTESTED, tool descriptions 12 September 2026:**

- `manage_proposals` action `create` prepares a proposal and returns a **preview, not a submission**: Connects price and balance, competing bid stats (Freelancer Plus), the client's screening questions, unmet preferred qualifications, and a boost block with the real competing boost bids. `confirm_preview` with type `proposal` submits it.
- **Boost bids live only in that preview,** never in `find_jobs get`. The `boost` block: `available` (false means do not offer it, `reason` says why), `current_top_bids` (the real competing bids, highest first, empty when nobody boosted; `current_top_bids_available` false means unknown, not zero), `recommended_connects` (the smallest bid that secures a top slot), `max_boost_connects` (balance minus the application's own price), `note` (how many paid slots this job has), `recommendation` (`skip` when boosting makes no sense). A boost is a bid, charged only if you land in the paid slots or the client engages before the auction closes. It cannot be edited or withdrawn once submitted.
- **Only one pending preview per action type.** A new `create` replaces the last unconfirmed one.
- **Mandatory before `create`:** `list_freelancer_proposals` action `invitations` and action `list` (an existing proposal makes `create` fail). For an invitation, the tool description names `accept_invitation`, but its preview or write behavior has not been measured. The Blueprint stops before that action and hands the prepared fields to the member for review and response on Upwork.
- **Before the manual submission, resolve** whether the member wants attachments or highlighted portfolio projects or certificates. Ask only when the job and saved member context do not already settle it.
- **Keeping up with Upwork (read only):** `list_freelancer_proposals` action `list` takes a `status` (`Accepted` means submitted, `Offered`, `Hired`, `Declined`, `Withdrawn`), 10 per page; action `get_room` gives the thread of one proposal once the client wrote. `get_messages` action `list_rooms` carries `awaiting_reply_from` (you or them) per room, `list_messages` reads newest first. `list_offers` action `list_mine` shows offers as `awaiting_your_acceptance` or `contract_started`; `list_contracts` action `search` with `contract_statuses`. `/brief` uses exactly these.

**MEASURED 12 September 2026, the `status` filter on `list` does not filter.** `Accepted`, `Offered`, `Pending` and `Activated` came back empty with "no submitted proposals yet". `Hired`, `Declined` and `Withdrawn` each returned the same mixed list (submitted, hired and declined proposals together, totals 44 to 56). So `/brief` takes each proposal's own `status` field and never trusts the filter it asked for, and an empty list proves nothing.

**A freelancer cannot message a client first on a proposal.** No room exists until the client writes. Applied proposals create no follow-up or task. `/brief` moves one to `lost` after 14 full days without a client reply.

### DOCUMENTED BUT UNTESTED, tool description read 12 September 2026: finding other freelancers

`get_tool_help` for `find_freelancers` returns a full tool description, so the server knows it, even though it does not appear in a freelancer account's default tool list.
**Whether a freelancer account may call it is untested.** Its actions:

- **`search`:** filters `query` (the role, short), `skills` (structured, ANDed), `title`, `earnings_min` and `earnings_max`, `job_success_min` (0 to 100), `top_rated`, `top_rated_plus`, `rising_talent`, `total_jobs_min`, `hours_billed_min`, `rate_min` and `rate_max`, location and language filters. Up to 10 results per call, paged with `offset`. Each result carries `profile_key` (for `get_profile`) and `personId` (for invitations, never interchange them).
- **`get_profile`:** skills, employment, education, job aggregates, portfolio when readable, and **`work_history`: each contract's title, dates, status, amount earned and the client's review.** An absent section is not evidence of no contracts; check `work_history_available`.
- **Boosted results are paid ad placements,** not merit. A benchmark skips them.
- Earnings in search results are bucketed for display ("$50K+"), never exact.

### MEASURED 14 August 2026: jobs

`find_jobs` action `search` returns only a truncated `description_snippet`; the full text requires action `get`.

**Ten results per call, and no way to ask for more in one go.** `limit` is capped at
10. **There is also no date filter**, so "only the last two days" can only be applied to results after they arrive.

More results come from **paging**: repeat the identical filters with `cursor` set to the previous response's `pageInfo.endCursor`, while `pageInfo.hasNextPage` is true. On a dense search, ten newest results cover only a few hours (measured: 8 to 16 hours per page), so a single page once a day misses most of what was posted, and misses it invisibly.

**Filters that exist:** `title` (job title only, words ANDed), `query` (whole posting, semantic), `skills`, `category`, `proposals_max` and `proposals_min`, `client_hires_min` and `max`, `budget_min` and `max` (fixed price), `rate_min` and `rate_max` (hourly), `experience_level`, `workload`, `timezone`, `location`, `previous_clients_only`, `job_type`. A client's `preferred_qualifications` are **not** in search results, only in `get`.

**MEASURED 12 September 2026:**

- **Every result now carries `url`,** a working job link. The old workaround (a search page with the job title) is gone.
- **`title` filters on the job title only,** words ANDed. Cleaner than `query`, which matches the whole posting semantically. It cannot be combined with `query` or `sort` relevance.
- Search results carry `proposal_count`, `applied`, `featured` and the client's `total_posted_jobs`, but no hire count; the hire record comes only from `get` (`client_record`).

**DOCUMENTED BUT UNTESTED, 12 September 2026: `smart_search`** reads Upwork's recommendation feeds for the profile. The description says `mode` `most_recent` accepts `days_posted`, `from_date` and `to_date`; `best_match` ranks by fit and ignores dates. It also describes `connect_price`, `applied` and a proposals tier.

#### What `find_jobs get` adds beyond search

- **`connects_cost`:** what applying costs. Nothing else tells you the price of a click.
- **`activityStat.applicationsBidStats`:** average, minimum and maximum rate bid by the competition. A price anchor, not a guess.
- **`activityStat.jobActivity`:** invites sent, hired, invited to interview, offered, unanswered invites. Is this still a real opening?
- **`preferred_qualifications`:** minimum Job Success Score, earnings, hours, English level, rising talent, portfolio, contractor type. Whether you clear the client's own bar at all.
- **`client_work_history`:** the client's recent contracts with feedback both ways. Do they actually hire, and how do they rate?
- **`clientCompanyPublic`:** city, country, timezone.
- **`contractTerms`:** experience level, engagement type, hourly budget, persons to hire.
- **`can_apply`:** whether the application path is even open.

Two cautions. **These come only from `get`, one call per job.** Pulling them for a whole list is exactly the request pattern Upwork flags as scraping, so fetch them when a job is opened or before applying, never in bulk. And the full description regularly carries a screening instruction the fields never show, such as a demand that the application begin with certain words. Read the description before writing a proposal.

### MEASURED since 14 August 2026, reading only

`get_freelancer_dashboard` action `check` (one call returns contracts, Connects, invitations, unread rooms, offers and Upwork's own match feed), `list_freelancer_proposals` (proposal records with creation time and job id), `get_messages`, `list_contracts`, `list_accounts` (the account list with each `org_uid`, and the tool description says to call it first), `get_account`, `set_tool_permission` action `get`. A 14 August message response had no author field, while the 12 September later responses exposed sender information. Treat message authorship as response-shape dependent and do not infer it from message order.

### Present but untested

- **`find_jobs` action `smart_search`:** new since the first measurement.
- Contracts and milestones beyond listing, attachments, `save_job`, `boost_profile`, `get_agency`, `set_tool_mode` (switching it is a write and needs a yes).
