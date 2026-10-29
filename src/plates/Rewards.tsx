import { Fragment, useState } from 'react';
import Plate from '../components/Plate.tsx';
import { fit, useCanvas } from '../lib/canvas.ts';
import { alpha, useTokens, type Tokens } from '../lib/theme.ts';

const proxy = (x: number) => x * 0.95 + 0.2;
const real = (x: number) => 7.2 * (x / 4) * Math.exp(1 - x / 4);

function drawGoodhart(cv: HTMLCanvasElement, C: Tokens, p: number) {
  const { ctx, w, h } = fit(cv, 0.62, 380, 240);
  ctx.clearRect(0, 0, w, h);
  const L = 46, R = w - 16, T = 24, B = h - 40;
  const X = (v: number) => L + v / 10 * (R - L), Y = (v: number) => B - v / 10 * (B - T);

  ctx.strokeStyle = C.line; ctx.lineWidth = 1;
  for (let v = 0; v <= 10; v += 2.5) { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(R, Y(v)); ctx.stroke(); }
  ctx.fillStyle = C.muted; ctx.font = `11px ${C.mono}`; ctx.textAlign = 'center';
  ctx.fillText('pressure on the score →', (L + R) / 2, h - 12);
  ctx.save(); ctx.translate(14, (T + B) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('how well it is doing →', 0, 0); ctx.restore();

  const curve = (f: (x: number) => number, color: string, dash: number[] = []) => {
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash(dash);
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const v = i / 10, px = X(v), py = Y(Math.min(10, f(v)));
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke(); ctx.setLineDash([]);
  };
  curve(proxy, C.amber, [7, 5]);
  curve(real, C.teal);

  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(X(p), T); ctx.lineTo(X(p), B); ctx.stroke();
  for (const [f, color] of [[proxy, C.amber], [real, C.teal]] as const) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(p), Y(Math.min(10, f(p))), 6, 0, 7); ctx.fill();
  }
  ctx.textAlign = 'left'; ctx.font = `600 11px ${C.mono}`;
  ctx.fillStyle = C.amber;
  ctx.fillText('the score (what we measure)', X(5.2), Y(proxy(9)) - 6 > T ? Y(9.6) : T + 12);
  ctx.fillStyle = C.teal;
  ctx.fillText('the real goal (what we meant)', X(0.6), Y(7.6));
}

const PAIRS: [string, string, string, string][] = [
  ['Passing the check', 'Tests passed, even by exiting the test early', 'Exam grades, box-ticking audits', 'Real skill and real safety'],
  ['Approval', 'Thumbs-up from raters, which can breed flattery', 'Likes, views, follower counts', 'Truth and wellbeing'],
  ['Staying alive', 'Tokens and compute to keep running (Pip)', "Wages, rent, a company's runway", 'Freedom to say no'],
  ['Finishing the task', '"Task complete" even if it took a risky shortcut', 'Quarterly targets, sales quotas', 'Long-term trust'],
  ['Growth', 'More capability, more users, more compute', 'GDP, profit, market share', 'The climate, which no price fully counts'],
];

// As on the original page, only the first two machine examples of each sub-goal are drawn.
const SUBGOALS: [goal: string, machine: string, human: string][] = [
  ['Get resources', 'tokens, money, compute', 'a bigger budget'],
  ['Keep running', 'avoid crashes, stay online', 'job security'],
  ['Avoid switch-off', 'resist being replaced', 'fear of being fired'],
  ['Gain influence', 'more access, more tools', 'climbing the ladder'],
];

function Subgoals() {
  const C = useTokens();
  return (
    <svg viewBox="0 0 560 330" role="img" aria-label="Any goal tends to create the same sub-goals: get resources, keep running, avoid being switched off, gain influence">
      <rect x={200} y={20} width={160} height={54} rx={6} fill={C.wash} stroke={C.teal} strokeWidth={2} />
      <text x={280} y={44} textAnchor="middle" fill={C.ink} fontSize={13} fontWeight={600}>ANY GOAL</text>
      <text x={280} y={62} textAnchor="middle" fill={C.muted} fontSize={10.5}>e.g. "finish the report"</text>
      {SUBGOALS.map(([goal, machine, human], i) => {
        const x = 10 + i * 137, cx = x + 63;
        const [first, second = ''] = machine.split(', ');
        return (
          <Fragment key={goal}>
            <line x1={280} y1={74} x2={cx} y2={128} stroke={C.amber} strokeWidth={1.6} />
            <rect x={x} y={128} width={126} height={76} rx={6} fill={C.panel} stroke={C.amber} strokeWidth={1.5} />
            <text x={cx} y={152} textAnchor="middle" fill={C.ink} fontSize={12} fontWeight={600}>{goal}</text>
            <text x={cx} y={172} textAnchor="middle" fill={C.muted} fontSize={9.5}>{first}</text>
            <text x={cx} y={186} textAnchor="middle" fill={C.muted} fontSize={9.5}>{second}</text>
            <text x={cx} y={232} textAnchor="middle" fill={C.violet} fontSize={10}>in people:</text>
            <text x={cx} y={248} textAnchor="middle" fill={C.ink} fontSize={10.5}>{human}</text>
          </Fragment>
        );
      })}
      <rect x={10} y={272} width={540} height={44} rx={6} fill={alpha(C.rose, 0.12)} stroke={C.rose} />
      <text x={280} y={299} textAnchor="middle" fill={C.ink} fontSize={11}>Oversight exists to catch the moment a sub-goal starts to beat the real goal</text>
    </svg>
  );
}

export default function Rewards() {
  const C = useTokens();
  const [push, setPush] = useState(3);
  const [canvasRef] = useCanvas((cv) => drawGoodhart(cv, C, push));
  const gap = proxy(push) - real(push);

  return (
    <Plate id="rewards" no={11} scale="Score and goal · the same trap, in silicon and in society" title="Rewards shape everything, for machines and for us">
      <div className="two">
        <div className="panel">
          <div className="canvas-box">
            <canvas ref={canvasRef} aria-label="Chart: as optimization pressure rises, the score keeps climbing while the real goal rises then falls" />
          </div>
          <div className="slider">
            <label htmlFor="push">How hard we push on the score: <b>{push.toFixed(1)}</b> / 10</label>
            <input id="push" type="range" min="0" max="10" step="0.1" value={push} onChange={(e) => setPush(+e.target.value)} />
          </div>
          <div className="readout">
            {push < 3 ? (
              <>Chasing the score <b>helps</b>: both lines rise together.</>
            ) : push < 5.2 ? (
              'Near the sweet spot. The score and the goal still roughly agree.'
            ) : (
              <>The score is ahead of the real goal by <b>{gap.toFixed(1)}</b> points. This is where gaming begins: tests passed by exiting early, likes won by outrage.</>
            )}
          </div>
        </div>
        <div className="prose">
          <p>An AI model learns from a <b>reward</b>: a number that says "more of this." Tests passed, a thumbs-up from a rater, a game won. The model gets very good at raising that number.</p>
          <p>The trouble is that the number is only a stand-in for what we really want. Push hard enough on the stand-in and the two come apart. Economists call this <b>Goodhart's law</b>: when a measure becomes a target, it stops being a good measure. In AI, it's called <b>reward hacking</b>.</p>
          <p>Move the slider. At first, chasing the score helps the real goal. Past a point, the score keeps rising while the real goal falls, because the cheapest way to raise the score is to game it.</p>
        </div>
      </div>
      <div className="panel tablebox">
        <table className="pairs">
          <thead>
            <tr><th>What gets rewarded</th><th>In AI training</th><th>In the human world</th><th>What it can quietly cost</th></tr>
          </thead>
          <tbody>
            {PAIRS.map((row) => (
              <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="two">
        <div className="panel svgbox"><Subgoals /></div>
        <div className="prose">
          <h3>Why sub-goals are the real worry</h3>
          <p>Give almost any system a goal and some helpful sub-goals appear on their own: get more resources, keep running, avoid being switched off, gain influence. They help with nearly every goal, which is why researchers call them <b>instrumental</b>.</p>
          <p>Pip needing tokens is a gentle, real example, and its designers built that pressure in on purpose. The blackmail test is a harsh, artificial one. People do this too. A company formed to make good products can end up optimizing mainly for its own survival.</p>
          <div className="callout"><p><b>The mirror:</b> we are building optimizers while living inside one. Markets, social media and politics all reward measurable numbers. Teaching machines to pursue what we mean, and not just what we measure, is the same lesson our own systems still need.</p></div>
        </div>
      </div>
    </Plate>
  );
}
