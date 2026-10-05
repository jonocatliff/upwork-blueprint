import assert from 'node:assert/strict';
import { nextStep, waitingState, replyDrafts } from '../../cockpit/lib/next-step.mjs';
import { daysInStage } from '../../cockpit/lib/list-view.mjs';
import { funnelSteps, funnelShapes } from '../../cockpit/lib/funnel.mjs';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { before, acted, complete, hired } = JSON.parse(input);
const today = new Date().toISOString().slice(0, 10);
assert.equal(daysInStage(before), daysInStage(acted));
assert.equal(nextStep(complete, today).label, 'Parked');
assert.equal(waitingState(complete, today).detail, 'Parked');
assert.equal(nextStep({ ...complete, client_waiting: true }, today).label, 'Reply');
assert.equal(nextStep({ ...complete, follow_up_plan: { lane: 'light', step: 1 }, next_follow_up: today }, today).label, 'Follow up');
assert.equal(nextStep({ ...complete, follow_up_history: [{ action: 'cleared' }] }, today).label, 'Parked');
assert.equal(nextStep(hired, today).label, '');
assert.equal(nextStep({ id: '730005', status: 'won', artifacts: ['project.md'], result_recorded_at: today }, today).label, '');
assert.equal(nextStep({ id: '730005', status: 'won', artifacts: ['project.md'] }, today).label, 'Record the result');
assert.equal(nextStep({ ...complete, status: 'won', artifacts: ['project.md'] }, today).label, 'Record the result');
assert.equal(nextStep({ ...complete, status: 'won', client_waiting: true }, today).label, 'Reply');
assert.equal(waitingState({ ...complete, client_waiting: true, next_follow_up: '2030-01-01' }, today).detail, 'Reply');
assert.match(nextStep({ id: '730005', status: 'offer' }, today).extras.join(' '), /\/proposal 730005/);
assert.doesNotMatch(nextStep({ id: '730005', status: 'offer', artifacts: ['proposal.md'] }, today).extras.join(' '), /\/proposal/);
assert.match(nextStep({ id: '730005', status: 'new', artifacts: ['pitch.html', 'application.md'] }, today).detail, /\/pitch-page 730005 submitted/);
assert.deepEqual(replyDrafts({ replies: { generated_at: today, drafts: [{ label: 'Direct', text: 'Fixture reply' }] } }),
  [{ label: 'Direct', text: 'Fixture reply' }]);

const shapes = funnelShapes(funnelSteps({ applied: 5, replied: 3, call: 1, offer: 1, won: 0 }), { width: 500 });
const widths = shapes.map(shape => {
  const points = shape.points.split(' ').map(point => point.split(',').map(Number));
  assert.equal(points[1][0] - points[0][0], points[2][0] - points[3][0]);
  return points[1][0] - points[0][0];
});
assert.deepEqual(widths, [500, 300, 100, 100, 0]);
