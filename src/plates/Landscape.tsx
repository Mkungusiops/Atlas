import { useEffect, useEffectEvent, useRef, useState } from 'react';
import Plate from '../components/Plate.tsx';
import { fit, useCanvas } from '../lib/canvas.ts';
import { useReducedMotion } from '../lib/hooks.ts';
import { alpha, hexRgb, useTokens, type Tokens } from '../lib/theme.ts';

type Pt = [number, number];

// The error surface: a wide valley (general skill) and a narrow pocket (memorization).
function loss(x: number, y: number) {
  return 1 - 0.9 * Math.exp(-((x - 0.68) ** 2 + (y - 0.4) ** 2) / 0.035) - 0.7 * Math.exp(-((x - 0.22) ** 2 + (y - 0.72) ** 2) / 0.004)
    + 0.06 * Math.sin(9 * x + 1) * Math.cos(7 * y) + 0.15 * ((x - 0.5) ** 2 + (y - 0.5) ** 2);
}

/** One downhill step from `b`, capped so the ball never jumps too far. */
function downhill(b: Pt): Pt {
  const e = 1e-3;
  const g = [(loss(b[0] + e, b[1]) - loss(b[0] - e, b[1])) / (2 * e), (loss(b[0], b[1] + e) - loss(b[0], b[1] - e)) / (2 * e)];
  let sx = -0.004 * g[0], sy = -0.004 * g[1];
  const L = Math.hypot(sx, sy);
  if (L > 0.008) { sx *= 0.008 / L; sy *= 0.008 / L; }
  return [sx, sy];
}

/** Renders the error surface once into a small bitmap with contour lines; it is scaled up when drawn. */
function buildTerrain(C: Tokens) {
  const W = 160, H = 100;
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  const c = off.getContext('2d')!;
  const im = c.createImageData(W, H);
  let mn = 1e9, mx = -1e9;
  const vals: number[] = [];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const v = loss(i / W, j / H);
    vals.push(v);
    mn = Math.min(mn, v);
    mx = Math.max(mx, v);
  }
  const lo = hexRgb(C.teal), hi = hexRgb(C.wash), ln = hexRgb(C.ink);
  vals.forEach((v, k) => {
    const t = Math.pow((v - mn) / (mx - mn), 0.8);
    let r = lo[0] + (hi[0] - lo[0]) * t, g = lo[1] + (hi[1] - lo[1]) * t, b = lo[2] + (hi[2] - lo[2]) * t;
    if ((t * 12) % 1 < 0.08) { r = r * 0.75 + ln[0] * 0.25; g = g * 0.75 + ln[1] * 0.25; b = b * 0.75 + ln[2] * 0.25; }
    im.data[k * 4] = r; im.data[k * 4 + 1] = g; im.data[k * 4 + 2] = b; im.data[k * 4 + 3] = 255;
  });
  c.putImageData(im, 0, 0);
  return off;
}

function label(ctx: CanvasRenderingContext2D, C: Tokens, text: string, x: number, y: number) {
  const w = ctx.measureText(text).width + 10;
  ctx.fillStyle = alpha(C.panel, 0.85);
  ctx.fillRect(x - w / 2, y - 12, w, 17);
  ctx.fillStyle = C.ink;
  ctx.fillText(text, x, y + 1);
}

function drawLand(cv: HTMLCanvasElement, terrain: HTMLCanvasElement, ball: Pt | null, trail: Pt[], C: Tokens) {
  const { ctx, w, h } = fit(cv, 0.62, 420, 220);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(terrain, 0, 0, w, h);
  ctx.font = `11px ${C.mono}`; ctx.textAlign = 'center'; ctx.fillStyle = C.panel;
  label(ctx, C, 'wide valley: general skill', 0.68 * w, 0.4 * h + 38);
  label(ctx, C, 'narrow pocket: memorized', 0.22 * w, 0.72 * h + 26);
  if (trail.length) {
    ctx.strokeStyle = C.amber; ctx.lineWidth = 2;
    ctx.beginPath();
    trail.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)));
    ctx.stroke();
  }
  if (ball) {
    ctx.fillStyle = C.amber; ctx.strokeStyle = C.panel; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ball[0] * w, ball[1] * h, 7, 0, 7); ctx.fill(); ctx.stroke();
  }
}

export default function Landscape() {
  const C = useTokens();
  const reduce = useReducedMotion();
  const ball = useRef<Pt | null>(null);
  const trail = useRef<Pt[]>([]);
  const terrain = useRef<{ C: Tokens; img: HTMLCanvasElement } | null>(null);
  const frame = useRef(0);
  const [status, setStatus] = useState('Rolling downhill…');
  const [canvasRef, paint] = useCanvas((cv) => {
    // The terrain bitmap depends only on the theme colours, so build it once per theme.
    if (terrain.current?.C !== C) terrain.current = { C, img: buildTerrain(C) };
    drawLand(cv, terrain.current.img, ball.current, trail.current, C);
  });

  const drop = () => {
    const b: Pt = [0.05 + Math.random() * 0.9, 0.05 + Math.random() * 0.9];
    ball.current = b;
    trail.current = [[b[0], b[1]]];
    let n = 0;
    setStatus('Rolling downhill…');
    cancelAnimationFrame(frame.current);

    const finish = () => {
      if (reduce) {
        for (; n < 600; n++) {
          const [sx, sy] = downhill(b);
          b[0] += sx;
          b[1] += sy;
          trail.current.push([b[0], b[1]]);
        }
        paint();
      }
      const dA = Math.hypot(b[0] - 0.68, b[1] - 0.4), dB = Math.hypot(b[0] - 0.22, b[1] - 0.72);
      setStatus(dA < 0.12 ? 'Landed in the wide valley: a general pattern.' : dB < 0.08 ? 'Stuck in the narrow pocket: memorized, brittle.' : 'Settled on a slope: still making mistakes.');
    };
    const step = () => {
      for (let k = 0; k < 3; k++) {
        const [sx, sy] = downhill(b);
        const noise = 0.0025 * Math.max(0, 1 - n / 250);
        b[0] = Math.min(0.99, Math.max(0.01, b[0] + sx + (Math.random() - 0.5) * noise));
        b[1] = Math.min(0.99, Math.max(0.01, b[1] + sy + (Math.random() - 0.5) * noise));
        n++;
      }
      trail.current.push([b[0], b[1]]);
      paint();
      if (n < 600 && !reduce) frame.current = requestAnimationFrame(step);
      else finish();
    };
    step();
  };

  // Like the original page, start with one model rolling as soon as the plate appears.
  const dropOnMount = useEffectEvent(drop);
  useEffect(() => {
    const start = requestAnimationFrame(() => dropOnMount());
    return () => {
      cancelAnimationFrame(start);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <Plate id="landscape" no={2} scale="Billions of dials · one point in a vast space" title="Training is a walk downhill in a landscape with billions of directions">
      <div className="two">
        <div className="panel">
          <div className="canvas-box">
            <canvas ref={canvasRef} aria-label="A map of error: a ball rolls downhill toward a valley" />
          </div>
          <div className="controls">
            <button className="btn primary" onClick={drop}>Drop a new model</button>
            <span className="mono muted">{status}</span>
          </div>
        </div>
        <div className="prose">
          <p>Imagine each weight is a dial. A model with two dials can be drawn as a map: left–right is one dial, up–down is the other, and the color shows how many mistakes the model makes at that setting. Darker teal means fewer mistakes.</p>
          <p>Training drops the model somewhere random and lets it roll downhill. The contour lines are like a hiking map of error.</p>
          <p>There are two kinds of valley here. The <b>wide valley</b> is a setting that captures a general pattern, so it keeps working on new examples. The <b>narrow pocket</b> is memorization: perfect on the training data, fragile on anything new. Drop a few models and watch where they land.</p>
          <div className="callout"><p>A real model doesn't have 2 dials. It has hundreds of billions, so the "map" has hundreds of billions of directions. That is what people mean by high-dimensional. Every bit of new training moves the model to a new point, and a new point means slightly different reasoning.</p></div>
          <p className="muted">When you chat with a model, it does not move. The weights stay frozen during a conversation. It only moves when its makers train it again.</p>
        </div>
      </div>
    </Plate>
  );
}
