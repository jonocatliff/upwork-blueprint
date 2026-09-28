// What a lead needs next: a command to copy into Claude Code, or a sentence for
// the member's own hands, plus the other commands that fit its stage. The
// cockpit runs nothing itself.
// The stage decides what a lead carries. `new` builds the pitch page until BOTH
// files exist, then the member submits by hand, and `/find-jobs skip <id>
// <reason>` stays available on every new lead. `applied` waits. `replied`, `call` and `offer`
// answer a waiting client first and a due follow-up second, where due means
// `next_follow_up <= today`; a future date stays Waiting. `/proposal` is offered
// in conversation and after the call, never once an offer exists. `won`
// writes the handover once and then carries nothing. `lost` and `skipped` carry
// no task even when a date is set and a client is waiting.
//
// The list never shows a date the reader has to subtract from today: it says
// `Waiting 3 days`, `Follow up in 5 days`, `Follow up . 2 days overdue`. Overdue
// is the only red state on the board.
import { todayIso } from './dates.mjs';

const WAITING = 'Waiting for the client. /brief picks up replies.';
const NOTHING = Object.freeze({ label: '', detail: '', command: null, extras: [] });

const has = (job, name) => (job.artifacts || []).includes(name);
// Chase every two days while the client owes an answer. Short enough to stay in
// their week, long enough not to be the freelancer who writes every morning.
//
// This is the fallback, not the schedule. A lead with a planned follow-up keeps
// its lane's escalating gaps from references/follow-ups.md (hot 1, 3, 7 business
// days; warm 2, 5, 10; light 3, 7), and `next_follow_up` wins here. The two days
// apply only where nothing is planned at all, so the two numbers never disagree
// about the same lead and neither should be changed to match the other.
const CHASE_DAYS = 2;

/** Whole days from a stamp to today, or null when there is no usable stamp. */
function daysSince(stamp, today) {
  const then = Date.parse(String(stamp || '').slice(0, 10) + 'T00:00:00Z');
  const now = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(then) || Number.isNaN(now)) return null;
  return Math.max(0, Math.round((now - then) / 864e5));
}

/** The chase a member owes when nothing else is scheduled: due every two days. */
function chase(job, today, command, extras) {
  const silent = daysSince(job.status_updated_at, today);
  if (silent == null) return step('Waiting', WAITING, null, extras);
  const over = silent - CHASE_DAYS;
  if (over >= 0) {
    return step('Follow up', `No answer for ${silent} day${silent === 1 ? '' : 's'}. Draft a nudge, then send it on Upwork.`, command, extras);
  }
  return step('Waiting', `Follow up in ${-over} day${over === -1 ? '' : 's'} unless they answer.`, null, extras);
}
const step = (label, detail, command = null, extras = []) => ({ label, detail, command, extras });

export function nextStep(job, today = todayIso()) {
  const id = job.id;
  switch (job.status) {
    case 'new': {
      const skip = [`/find-jobs skip ${id} <reason>`];
      return has(job, 'pitch.html') && has(job, 'application.md')
        ? step('Submit on Upwork', 'Record the Loom, put its link into the cover letter where it says [LOOM LINK] and submit on Upwork. /brief then moves it to Applied.', null, skip)
        : step('Build pitch page', 'Builds the pitch page and the application.', `/pitch-page ${id}`, skip);
    }
    case 'applied':
      return step('Waiting', WAITING);
    case 'replied':
    case 'call':
    case 'offer': {
      // The audit costs money, so it is offered once. A saved website is not asked
      // for again, and a published audit is not rebuilt.
      const audit = job.lead_magnet_url ? [] : [job.lead_magnet_source ? `/lead-magnet ${id}` : `/lead-magnet ${id} <website>`];
      const proposal = `/proposal ${id} <transcript path or notes>`;
      const extras = [...(job.status === 'replied' ? [proposal] : []), ...audit];
      if (job.client_waiting) return step('Reply', 'The client is waiting. Draft a reply, then send it on Upwork.', `/brief ${id}`, extras);
      if (job.next_follow_up && job.next_follow_up <= today) return step('Follow up', 'A follow-up is due. Draft a nudge, then send it on Upwork.', `/brief ${id}`, extras);
      if (job.status === 'call') {
        // Booked for later: the chase stops until the call has happened.
        if (job.call_at && job.call_at > today) {
          return step('Call booked', `The call is on ${job.call_at}. Nothing to chase until then.`, null, audit);
        }
        // The call is behind us, and the one-pager is the work the stage carries.
        if (!has(job, 'proposal.md')) {
          return step('Write the proposal', 'Turns the call into the one-pager the client decides on.', proposal, audit);
        }
        // Sent, and now it is chased like anything else the client owes an answer to.
        return chase(job, today, `/brief ${id}`, audit);
      }
      if (job.status === 'offer') {
        return step('Review offer', 'Review the offer on Upwork. /brief moves it to Won once the contract starts.', null, extras);
      }
      // In conversation: chase until there is a call.
      return chase(job, today, `/brief ${id}`, extras);
    }
    case 'won':
      // A won lead used to show nothing at all, which reads as finished when the work has
      // not started. The second /won pass is the one step nobody else owns: it records what
      // was delivered, and that is what makes the next proposal provable.
      return has(job, 'project.md')
        ? step('Record the result', 'After delivery: what came out of it, with a number and where it can be checked.', `/won ${id}`)
        : step('Write handover', 'Turns the contract into the handover brief and the onboarding.', `/won ${id}`);
    default:
      return { ...NOTHING, extras: [] };
  }
}

/** The reply drafts written after the client's latest message. Older drafts answer an old message. */
// What a member needs at a glance in the list: are we acting, waiting, or has a
// follow-up already been set, and how long has this lead sat where it sits.
/** Whole days from today to a date, negative once it is in the past. */
export function dueIn(iso, today = todayIso()) {
  if (!iso) return null;
  const then = Date.parse(`${iso}T00:00:00Z`), now = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(then) || Number.isNaN(now)) return null;
  return Math.round((then - now) / 864e5);
}

/** The same number as a person would say it. */
export function whenText(days) {
  if (days == null) return '';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days > 1) return `in ${days} days`;
  return days === -1 ? '1 day overdue' : `${-days} days overdue`;
}

export function waitingState(job, today = todayIso(), now = Date.now()) {
  const at = Date.parse(job.status_updated_at || job.found_at || '');
  const days = Number.isNaN(at) ? null : Math.max(0, Math.floor((now - at) / 864e5));
  const age = days == null ? '' : days === 0 ? 'today' : days === 1 ? '1 day' : `${days} days`;
  const step = nextStep(job, today);
  const acting = Boolean(step.command) || step.label === 'Reply' || step.label === 'Follow up';
  const due = dueIn(job.next_follow_up, today);
  if (job.next_follow_up && job.next_follow_up > today) {
    return { kind: 'follow-up set', detail: `Follow up ${whenText(due)}`, age, days, due };
  }
  if (acting) {
    // A task with a date carries it: late is the only thing on this board that is red.
    const detail = step.label || 'Act';
    return { kind: 'act', detail: due != null && due < 0 ? `${detail} · ${whenText(due)}` : detail,
             age, days, due, late: due != null && due < 0 };
  }
  return { kind: 'waiting', detail: age ? `Waiting ${age}` : 'Waiting', age, days, due };
}

export function replyDrafts(job) {
  const replies = job.replies || {};
  const drafts = (Array.isArray(replies.drafts) ? replies.drafts : [])
    .map(draft => String(draft?.text || '').trim()).filter(Boolean);
  if (!drafts.length) return [];
  const clientTimes = ((job.thread || {}).messages || [])
    .filter(message => message?.kind !== 'event' && message?.from !== 'me')
    .map(message => Date.parse(message.at) || 0);
  return (Date.parse(replies.generated_at) || 0) >= Math.max(0, ...clientTimes) ? drafts : [];
}
