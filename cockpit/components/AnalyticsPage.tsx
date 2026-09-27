'use client';

import { useCockpit } from '@/lib/context';
import { funnelShapes, funnelSteps } from '@/lib/funnel.mjs';

// One hue from light to dark, checked with the dataviz ordinal validator against the white card.
const RAMP = ['#86b6ef', '#4f94e4', '#4f94e4', '#1a6ad0', '#0c3f86'];
const WIDTH = 560, HEIGHT = 84, GAP = 2, LABEL_X = 610;

const BAR_W = 46, BAR_GAP = 10, CHART_H = 132;

/** Applications per week. The funnel says how well it converted, this says whether
 *  it happened at all, which is the part a member is actually in charge of. */
function Outreach({ weeks }: { weeks: { week: string; count: number }[] }) {
  if (!weeks?.length) return null;
  const total = weeks.reduce((sum, w) => sum + w.count, 0);
  const best = Math.max(...weeks.map(w => w.count));
  const quiet = weeks.filter(w => !w.count).length;
  const width = weeks.length * (BAR_W + BAR_GAP) - BAR_GAP;
  const label = (iso: string) => {
    const date = new Date(iso + 'T00:00:00');
    return `${date.getDate()}.${date.getMonth() + 1}.`;
  };
  return <section className="funnel" aria-label="Applications per week">
    <h2>Outreach</h2>
    <p className="funnel-headline">{total
      ? <><strong>{total}</strong> application{total === 1 ? '' : 's'} in {weeks.length} weeks · best week {best}{quiet ? ` · ${quiet} week${quiet === 1 ? '' : 's'} with none` : ''}</>
      : 'Nothing sent in the last twelve weeks.'}</p>
    <div className="funnel-card">
      <svg className="funnel-chart" viewBox={`0 0 ${width} ${CHART_H + 34}`} role="img"
           aria-label={`Applications per week, ${total} in total`}>
        {weeks.map((week, index) => {
          const scale = best ? week.count / best : 0;
          const height = Math.round(scale * CHART_H);
          const x = index * (BAR_W + BAR_GAP);
          const last = index === weeks.length - 1;
          return <g key={week.week}>
            <title>{`Week of ${label(week.week)}: ${week.count} application${week.count === 1 ? '' : 's'}`}</title>
            <rect x={x} y={CHART_H - height} width={BAR_W} height={Math.max(height, 2)} rx={4}
                  fill={last ? '#86b6ef' : '#1a6ad0'} />
            {week.count ? <text x={x + BAR_W / 2} y={CHART_H - height - 6} className="funnel-count"
                                textAnchor="middle" fontSize={15}>{week.count}</text> : null}
            <text x={x + BAR_W / 2} y={CHART_H + 22} className="funnel-rate" textAnchor="middle">{label(week.week)}</text>
          </g>;
        })}
      </svg>
    </div>
    <p className="funnel-note">Counted from each lead&rsquo;s own history, where /brief records the send. The last bar is this week, still running.</p>
  </section>;
}


/** The one thing the cockpit tracks: from application to won. */
export default function AnalyticsPage() {
  const { state } = useCockpit();
  if (!state) return null;
  const steps = funnelSteps(state.funnel);
  const shapes = funnelShapes(steps, { width: WIDTH, height: HEIGHT, gap: GAP });
  // By key, not by position: adding a stage silently turned "won" into the offer count.
  const applied = steps.find(step => step.key === 'applied') || { count: 0 };
  const won = steps.find(step => step.key === 'won') || { count: 0 };
  const winRate = applied.count ? Math.round(100 * won.count / applied.count) : null;
  const total = steps.length * (HEIGHT + GAP) - GAP;
  return <section className="funnel" aria-label="Funnel">
    <h2>Funnel</h2>
    <p className="funnel-headline">{applied.count
      ? <><strong>{won.count}</strong> won from {applied.count} applications{winRate != null ? ` · ${winRate}% win rate` : ''}</>
      : 'No applications yet. The funnel fills as /brief records them.'}</p>
    <div className="funnel-card">
      <svg className="funnel-chart" viewBox={`0 0 1000 ${total}`} role="img" aria-label="Funnel from applications sent to won">
        {shapes.map((shape, index) => {
          const mid = shape.y + HEIGHT / 2;
          const before = (shape.of || '').toLowerCase();
          return <g key={shape.key} className="funnel-step">
            <title>{`${shape.label}: ${shape.count}${shape.rate != null ? ` (${shape.rate}% of ${before}, ${shape.overall}% of all applications)` : ''}`}</title>
            <polygon points={shape.points} fill={RAMP[index]} />
            <text x={LABEL_X} y={mid - 6} className="funnel-count">{shape.count}</text>
            <text x={LABEL_X + 72} y={mid - 6} className="funnel-label">{shape.label}</text>
            <text x={LABEL_X + 72} y={mid + 16} className="funnel-rate">{shape.rate != null
              ? `${shape.rate}% of ${before}${shape.overall != null && shape.overall !== shape.rate ? ` · ${shape.overall}% of all applications` : ''}`
              : 'every lead you applied to'}</text>
          </g>;
        })}
      </svg>
    </div>
    <p className="funnel-note">Every lead counts once at each stage it ever reached.</p>
    <Outreach weeks={state.outreach} />
  </section>;
}
