# Upwork: the connector, operationally

What a command needs to call Upwork correctly. Background, policy sources and reasoning live in `RESEARCH.md`.

Every claim carries its measurement date. **MEASURED** means called against a real account. **DOCUMENTED BUT UNTESTED** means read from the connector's tool description and never exercised; a command may not rely on it without saying so.

## Hard constraints

1. A human starts every Upwork call. No timer, no background job, no hosted agent.
2. The member sends every message, proposal and offer. The Blueprint drafts only.
3. Never buy Connects. Say what an application costs and what is left.
4. `python3 code/pipeline.py prune` after every run. Upwork content is cached 24 hours at most; the member's own scores, notes and history stay.
5. No login leaves this machine.
6. Every run ends with `Upwork calls: N`. A run stays under 30 calls.
7. Full job details one job at a time, when a job is opened or before applying, never for a list.
8. No contact information before the contract starts, given or asked for (checked 12 September 2026). A link to your work is allowed, so every page this repo publishes for a client carries no email, phone, WhatsApp, booking link, contact form or social profile, and says "reply here on Upwork" instead. Meetings run on Upwork's own video calls. Exception: Enterprise plan on either side.
9. Pipeline state is written only through `python3 code/pipeline.py`.

## Call routes

Use fresh local state first: a cached response under 24 hours old answers the same question without a call. State the planned call budget before calling.

- Job discovery: `find_jobs search` or `smart_search`; page only until the stated time window or enough candidates are covered.
- Full job facts: `find_jobs get`, one opened or shortlisted job, never a list.
- Profile: `get_profile`; `list_highlights` only when portfolio or certificates matter.
- Pipeline state: proposal, offer and contract list calls once per required first page. `get_room` only for pipeline jobs that can have a client reply.
- Messages: `list_rooms` once for waiting state, then `list_messages` only for the rooms being reviewed.

Stop when the requested fact is known; never broaden a search to make an empty result look productive. Every write needs approval for the exact action and content: profile previews stay unconfirmed until the member says yes, proposal previews are never confirmed here at all.

## Profile

**MEASURED 14 August 2026, `get_profile` action `get` without a key** (your own profile): title, full overview text, skills, languages and proficiency, education, employment history, hourly rate, `profileAggregates` (earnings, job counts, feedback count), location, availability, profile URL.

**MEASURED 12 September 2026, `get_profile` action `get` with a `profile_key`** (starts with `~`, from any public profile URL): another freelancer's public profile. The fields sit under `data.talentProfileByProfileKey`, not `data`, and `profileAggregates` adds the badge (`top_rated`), the earnings bucket ("$100K+") and `totalFeedback`.

`get_profile` action `list_highlights`: portfolio projects (id and title) and certificates, titles only, no contents. Actions `transactions` and `connects_balance` exist, untested.

**Not in any profile response**, only on the public profile page: Job Success Score, client review texts, billed hours, portfolio contents, intro video (no field exists, which says nothing about whether one exists). The review *count* is there, as `profileAggregates.totalFeedback`.

**MEASURED 12 September 2026:** `get_freelancer_dashboard` and `list_contracts` action `search` carry no Job Success Score either. The dashboard does show Connects spending line by line; that is how a recurring "Paid invitation badge" charge of one Connect every twelve hours became visible.

**Writing, MEASURED 14 August 2026:** `update_profile` wrote only availability, employment, languages, education and other experience. **DOCUMENTED BUT UNTESTED, tool description 12 September 2026:** `update_title` (70 characters max), `update_overview` (5,000 characters max), `set_skills` (the complete set, 20 max, names resolved to Upwork's skill list, custom skills rejected). **Not writable: hourly rate, portfolio, video.** Every write returns a preview and runs only through `confirm_preview` after an explicit yes.

**DOCUMENTED BUT UNTESTED, 12 September 2026:** `boost_profile` action `get_status` reads the Availability Badge and any profile boost ad. `toggle_availability_badge` with `enabled: false` switches the badge off; switching it on or starting ads happens only on upwork.com.

## Jobs

**MEASURED 14 August 2026.** `find_jobs search` returns only a truncated `description_snippet`; the full text needs action `get`.

- **`limit` is hard at 10** results per call, with no way to ask for more.
- **There is no date filter**, so "only the last two days" can be applied only after results arrive.
- More results come from paging: identical filters with `cursor` set to the previous `pageInfo.endCursor` while `pageInfo.hasNextPage` is true. On a dense search ten newest results cover 8 to 16 hours, so one page a day misses most of what was posted, invisibly.
- Filters that exist: `title` (job title only, words ANDed), `query` (whole posting, semantic), `skills`, `category`, `proposals_max`/`proposals_min`, `client_hires_min`/`max`, `budget_min`/`max` (fixed price), `rate_min`/`rate_max` (hourly), `experience_level`, `workload`, `timezone`, `location`, `previous_clients_only`, `job_type`. `preferred_qualifications` is **not** in search results, only in `get`.

**MEASURED 12 September 2026:** every result carries `url`, a working job link. `title` cannot be combined with `query` or with `sort` relevance. Results carry `proposal_count`, `applied`, `featured` and the client's `total_posted_jobs`, but no hire count; the hire record comes only from `get` (`client_record`).

**DOCUMENTED BUT UNTESTED, 12 September 2026:** `smart_search` reads Upwork's recommendation feeds for the profile. `mode` `most_recent` accepts `days_posted`, `from_date` and `to_date`; `best_match` ranks by fit and ignores dates. It also describes `connect_price`, `applied` and a proposals tier.

**What `find_jobs get` adds:** `connects_cost` (what applying costs), `activityStat.applicationsBidStats` (average, minimum and maximum competing rate), `activityStat.jobActivity` (invites sent, hired, invited to interview, offered, unanswered invites), `preferred_qualifications` (minimum Job Success Score, earnings, hours, English level, rising talent, portfolio, contractor type), `client_work_history` (recent contracts with feedback both ways), `clientCompanyPublic` (city, country, timezone), `contractTerms` (experience level, engagement type, hourly budget, persons to hire), `can_apply`. The full description regularly carries a screening instruction no field shows, such as a mandatory opening phrase: read it before writing a proposal.

## Proposals, rooms and pipeline

**MEASURED 12 September 2026: the `status` filter on `list_freelancer_proposals` action `list` does not filter.** `Accepted`, `Offered`, `Pending` and `Activated` came back empty with "no submitted proposals yet"; `Hired`, `Declined` and `Withdrawn` each returned the same mixed list, totals 44 to 56. Read each proposal's own `status` field, never trust the filter, and treat an empty list as proof of nothing.

**A freelancer cannot message a client first.** No room exists until the client writes, and applied proposals create no follow-up or task. `/brief` moves one to `lost` after 14 full days without a reply.

**MEASURED since 14 August 2026, reading only:** `get_freelancer_dashboard` action `check` (one call returns contracts, Connects, invitations, unread rooms, offers and Upwork's match feed), `list_freelancer_proposals` (records with creation time and job id), `get_messages`, `list_contracts`, `list_accounts` (each `org_uid`; the tool description says to call it first), `get_account`, `set_tool_permission` action `get`. Message authorship is response-shape dependent: a 14 August response had no author field, 12 September responses exposed sender information. Never infer authorship from message order.

**DOCUMENTED BUT UNTESTED, tool descriptions 12 September 2026:**

- `manage_proposals` action `create` returns a preview, not a submission: Connects price and balance, competing bid stats (Freelancer Plus), the client's screening questions, unmet preferred qualifications, and a boost block. `confirm_preview` with type `proposal` would submit it; the Blueprint does not.
- Boost bids live only in that preview, never in `find_jobs get`. The `boost` block: `available` (false means do not offer it, `reason` says why), `current_top_bids` (real competing bids, highest first; `current_top_bids_available` false means unknown, not zero), `recommended_connects`, `max_boost_connects` (balance minus the application's own price), `note` (paid slots on this job), `recommendation` (`skip`). A boost cannot be edited or withdrawn once submitted.
- Only one pending preview per action type; a new `create` replaces the last unconfirmed one.
- Before `create`: `list_freelancer_proposals` action `invitations` and action `list`, because an existing proposal makes `create` fail. `accept_invitation` exists, its behavior is unmeasured, and the Blueprint stops before it.
- Read-only pipeline: `list_freelancer_proposals` action `list` takes a `status` (`Accepted` means submitted, plus `Offered`, `Hired`, `Declined`, `Withdrawn`), 10 per page; action `get_room` gives one proposal's thread once the client wrote. `get_messages` action `list_rooms` carries `awaiting_reply_from` per room, `list_messages` reads newest first. `list_offers` action `list_mine` shows `awaiting_your_acceptance` or `contract_started`; `list_contracts` action `search` takes `contract_statuses`. `/brief` uses exactly these.

## Other freelancers

**DOCUMENTED BUT UNTESTED, 12 September 2026.** `get_tool_help` for `find_freelancers` returns a full description, so the server knows it, though it is absent from a freelancer account's default tool list. Whether a freelancer account may call it is untested.

- `search` filters: `query`, `skills` (ANDed), `title`, `earnings_min`/`max`, `job_success_min` (0 to 100), `top_rated`, `top_rated_plus`, `rising_talent`, `total_jobs_min`, `hours_billed_min`, `rate_min`/`rate_max`, location and language. 10 results per call, paged with `offset`. Each result carries `profile_key` (for `get_profile`) and `personId` (for invitations, never interchangeable). Earnings are bucketed ("$50K+"), never exact, and boosted results are paid placements, not merit.
- `get_profile`: skills, employment, education, job aggregates, portfolio when readable, and `work_history` (each contract's title, dates, status, amount earned and the client's review). An absent section is not evidence of no contracts; check `work_history_available`.

## Present but untested

`find_jobs` action `smart_search`, contracts and milestones beyond listing, attachments, `save_job`, `boost_profile`, `get_agency`, `set_tool_mode` (switching it is a write and needs a yes).
