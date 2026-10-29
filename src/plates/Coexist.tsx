import { useEffect, useRef } from 'react';
import Plate from '../components/Plate.tsx';
import { fit, useCanvas } from '../lib/canvas.ts';
import { useReducedMotion } from '../lib/hooks.ts';
import { alpha, useTokens, type Tokens } from '../lib/theme.ts';

const KNOTS = ['consent', 'checking', 'care', 'credit', 'clean power'];

const CHARTER: [title: string, text: string][] = [
  ['Consent', 'Agents ask before money, deletions or messages. People can always say no.'],
  ['Checking', 'Independent tests, published like safety ratings, so trust is earned.'],
  ['Care', 'Humans keep the work that is about people: judgment, comfort and responsibility.'],
  ['Credit', 'The gains are shared through wages, prices and public services, not kept by a few.'],
  ['Clean power', 'Every new data centre brings its own clean electricity.'],
  ['Identity', 'Every agent says what it is and who it acts for.'],
];

/** The generative "braided river" painting at animation time `t`. */
function drawRiver(cv: HTMLCanvasElement, C: Tokens, t: number) {
  const { ctx, w, h } = fit(cv, 0.5, 480, 320);
  const mid = h * 0.44, A = h * 0.26, k = 6 * Math.PI / w;
  ctx.fillStyle = C.panel;
  ctx.fillRect(0, 0, w, h);

  // sky speckle
  for (let i = 0; i < 90; i++) {
    const x = (i * 97.13) % w, y = (i * 53.7) % (h * 0.9);
    ctx.fillStyle = alpha(i % 3 ? C.teal : C.amber, 0.10 + 0.08 * Math.sin(t * 0.6 + i));
    ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 4), 0, 7); ctx.fill();
  }

  // ground wash
  const g = ctx.createLinearGradient(0, h * 0.55, 0, h);
  g.addColorStop(0, alpha(C.wash, 0));
  g.addColorStop(1, alpha(C.violet, 0.12));
  ctx.fillStyle = g;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);

  // the two braided streams: warm people, cool machines
  const streams: [string, number][] = [[C.amber, 0], [C.teal, Math.PI]];
  streams.forEach(([col, ph], si) => {
    for (let st = 0; st < 16; st++) {
      const off = (st - 7.5) * 2.6;
      ctx.strokeStyle = alpha(col, 0.18 + 0.035 * (st % 5));
      ctx.lineWidth = 1.6 + (st % 3);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const env = Math.abs(Math.sin(k * x));
        const y = mid + A * Math.sin(k * x + ph) + off * (0.35 + env) + 3 * Math.sin(x * 0.02 + t * (1 + st * 0.07) + st + si * 2);
        if (x) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  });

  // the knots where the streams cross
  ctx.font = `600 ${w < 500 ? 10 : 12}px ${C.mono}`;
  ctx.textAlign = 'center';
  KNOTS.forEach((label, i) => {
    const x = w * (i + 1) / 6;
    ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, mid, 9, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.violet;
    ctx.beginPath(); ctx.arc(x, mid, 4, 0, 7); ctx.fill();
    const tw = ctx.measureText(label).width + 12;
    ctx.fillStyle = alpha(C.panel, 0.9);
    ctx.fillRect(x - tw / 2, mid + 16, tw, 20);
    ctx.fillStyle = C.ink;
    ctx.fillText(label, x, mid + 30);
  });

  // a procession of people and agents walking together along the bank
  const base = h - 30, n = Math.max(3, Math.floor((w - 320) / 70));
  for (let i = 0; i < n; i++) {
    const x = 30 + i * 70 + (t * 8) % 70, bob = Math.sin(t * 3 + i) * 1.5;
    if (x > w - 300) continue;
    ctx.strokeStyle = C.amber; ctx.fillStyle = C.amber; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(x, base - 26 + bob, 5, 0, 7); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, base - 20 + bob); ctx.lineTo(x, base - 6 + bob);
    ctx.moveTo(x, base - 6 + bob); ctx.lineTo(x - 5, base + 4);
    ctx.moveTo(x, base - 6 + bob); ctx.lineTo(x + 5, base + 4);
    ctx.moveTo(x, base - 16 + bob); ctx.lineTo(x + 14, base - 14 + bob);
    ctx.stroke();
    const ax = x + 26, ab = Math.sin(t * 3 + i + 1.5) * 1.5;
    ctx.fillStyle = alpha(C.teal, 0.85);
    ctx.beginPath(); ctx.roundRect(ax - 8, base - 24 + ab, 16, 18, 4); ctx.fill();
    ctx.fillStyle = C.panel;
    ctx.beginPath(); ctx.arc(ax, base - 16 + ab, 2.5, 0, 7); ctx.fill();
    ctx.strokeStyle = C.teal;
    ctx.beginPath();
    ctx.moveTo(ax - 8, base - 16 + ab); ctx.lineTo(x + 14, base - 14 + bob);
    ctx.moveTo(ax - 3, base - 6 + ab); ctx.lineTo(ax - 4, base + 4);
    ctx.moveTo(ax + 3, base - 6 + ab); ctx.lineTo(ax + 4, base + 4);
    ctx.stroke();
  }

  ctx.textAlign = 'left'; ctx.font = `600 12px ${C.mono}`; ctx.fillStyle = C.amber;
  ctx.fillText('PEOPLE · values, judgment, direction', 14, 22);
  ctx.textAlign = 'right'; ctx.fillStyle = C.teal;
  ctx.fillText('MACHINES · speed, scale, tireless work', w - 14, h - 14);
}

export default function Coexist() {
  const C = useTokens();
  const reduce = useReducedMotion();
  const time = useRef(0);
  const [canvasRef, paint] = useCanvas((cv) => drawRiver(cv, C, time.current));

  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    const loop = () => {
      time.current += 0.016;
      paint();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reduce, paint]);

  return (
    <Plate id="coexist" no={15} scale="The picture we choose" title="Living together: humans and AI as one braided river">
      <div className="panel">
        <div className="canvas-box">
          <canvas ref={canvasRef} aria-label="Painting: a warm human stream and a cool machine stream braid together, crossing at knots labelled consent, checking, care, credit and clean power" />
        </div>
        <div className="art-cap">A generative painting. The warm stream is people: values, judgment, direction. Along the bank, people and agents walk hand in hand. The cool stream is machines: speed, scale, tireless work. They braid together, and where they cross, a knot holds them: consent, checking, care, credit and clean power. Without the knots, the streams pull apart or one swallows the other.</div>
      </div>
      <div className="two">
        <div className="prose">
          <h3>What good co-existence looks like</h3>
          <p>Picture a nurse in 2035. Her agent has drafted the shift notes, flagged two drug interactions and booked a follow-up. She spends the hour she saved sitting with a frightened patient. That work is hers, and nobody wants to automate it.</p>
          <p>Picture a farmer whose agent reads soil sensors and weather models and suggests when to plant. She overrules it, because she knows the low field floods. The agent records why, and learns.</p>
          <p>Picture a city where every agent carries an ID tag saying who it works for, where data centres run on the same new solar farms that power the schools, and where a public lab can check the biggest models the way inspectors check bridges.</p>
        </div>
        <div className="prose">
          <h3>The knots that hold the braid</h3>
          <div className="charter">
            {CHARTER.map(([title, text]) => (
              <div className="why panel" key={title}>
                <b>{title}</b>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="callout"><p><b>The creative bet:</b> the best future is a braid, not a handover and not a wall. Machines do more of the measurable work. Humans stay in charge of what the measures are for.</p></div>
    </Plate>
  );
}
