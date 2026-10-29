import { useEffect, useRef, useState } from 'react';
import Plate from '../components/Plate.tsx';
import { fit, useCanvas } from '../lib/canvas.ts';
import { useReducedMotion } from '../lib/hooks.ts';
import { alpha, useTokens, type Tokens } from '../lib/theme.ts';

type Net = { W1: number[][]; b1: number[]; W2: number[]; b2: number; steps: number };
type Glow = { w1: number[][]; w2: number[] };

const sig = (z: number) => 1 / (1 + Math.exp(-z));
const W1_0 = [[0.3, -0.5, 0.2], [-0.4, 0.1, 0.6], [0.5, 0.3, -0.2]];
const W2_0 = [0.2, -0.3, 0.4];
const freshNet = (): Net => ({ W1: W1_0.map((r) => r.slice()), b1: [0, 0, 0], W2: W2_0.slice(), b2: 0, steps: 0 });
const freshGlow = (): Glow => ({ w1: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], w2: [0, 0, 0] });

function fwd(net: Net, x: number[]) {
  const h = net.W1.map((r, j) => sig(r[0] * x[0] + r[1] * x[1] + r[2] * x[2] + net.b1[j]));
  const o = sig(h[0] * net.W2[0] + h[1] * net.W2[1] + h[2] * net.W2[2] + net.b2);
  return { h, o };
}

// The eight possible emails; the right answer is "scam" when two or more warning signs are present.
const data: { x: number[]; t: number }[] = [];
for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) data.push({ x: [a, b, c], t: a + b + c >= 2 ? 1 : 0 });

/** One round of gradient descent over all eight examples. Weights that move start to glow. */
function trainStep(net: Net, glow: Glow) {
  const gW1 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], gb1 = [0, 0, 0], gW2 = [0, 0, 0];
  let gb2 = 0;
  for (const { x, t } of data) {
    const { h, o } = fwd(net, x);
    const dO = o - t;
    for (let j = 0; j < 3; j++) {
      gW2[j] += dO * h[j];
      const dh = dO * net.W2[j] * h[j] * (1 - h[j]);
      gb1[j] += dh;
      for (let i = 0; i < 3; i++) gW1[j][i] += dh * x[i];
    }
    gb2 += dO;
  }
  const lr = 3 / data.length;
  for (let j = 0; j < 3; j++) {
    const d2 = lr * gW2[j];
    net.W2[j] -= d2;
    glow.w2[j] = Math.min(1, glow.w2[j] + Math.abs(d2) * 4);
    net.b1[j] -= lr * gb1[j];
    for (let i = 0; i < 3; i++) {
      const d = lr * gW1[j][i];
      net.W1[j][i] -= d;
      glow.w1[j][i] = Math.min(1, glow.w1[j][i] + Math.abs(d) * 6);
    }
  }
  net.b2 -= lr * gb2;
  net.steps++;
}

/** Dims the glow a little; returns whether any line is still visibly lit. */
function fadeGlow(glow: Glow) {
  let lit = false;
  for (let j = 0; j < 3; j++) {
    glow.w2[j] *= 0.93;
    if (glow.w2[j] > 0.02) lit = true;
    for (let i = 0; i < 3; i++) {
      glow.w1[j][i] *= 0.93;
      if (glow.w1[j][i] > 0.02) lit = true;
    }
  }
  return lit;
}

const FEATURES = ['money', 'stranger', 'urgent'];
const QUESTIONS = ['asks for money', 'is from a stranger', 'sounds urgent'];

function drawNet(cv: HTMLCanvasElement, net: Net, glow: Glow, inputs: number[], C: Tokens) {
  const { ctx, w, h } = fit(cv, 0.55, 320, 230);
  ctx.clearRect(0, 0, w, h);
  const xI = w * 0.16, xH = w * 0.5, xO = w * 0.84;
  const yI = [h * 0.2, h * 0.5, h * 0.8], yH = [h * 0.22, h * 0.5, h * 0.78], yO = h * 0.5;
  const { h: hv, o } = fwd(net, inputs);

  const edge = (x1: number, y1: number, x2: number, y2: number, wt: number, g: number) => {
    if (g > 0.02) {
      ctx.strokeStyle = alpha(C.amber, 0.55 * g);
      ctx.lineWidth = Math.min(14, 1 + Math.abs(wt) * 2.2) + 6;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.strokeStyle = alpha(wt >= 0 ? C.teal : C.rose, 0.85);
    ctx.lineWidth = Math.min(12, 0.8 + Math.abs(wt) * 2.2);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  };
  const node = (x: number, y: number, a: number, r: number, label?: string) => {
    ctx.fillStyle = C.panel; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = alpha(C.amber, 0.15 + 0.85 * a);
    ctx.beginPath(); ctx.arc(x, y, r - 4, 0, 7); ctx.fill();
    if (label) {
      ctx.fillStyle = C.muted; ctx.font = `11px ${C.mono}`; ctx.textAlign = 'center';
      ctx.fillText(label, x, y + r + 15);
    }
  };

  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) edge(xI, yI[i], xH, yH[j], net.W1[j][i], glow.w1[j][i]);
  for (let j = 0; j < 3; j++) edge(xH, yH[j], xO, yO, net.W2[j], glow.w2[j]);
  for (let i = 0; i < 3; i++) node(xI, yI[i], inputs[i], 15, FEATURES[i]);
  for (let j = 0; j < 3; j++) node(xH, yH[j], hv[j], 13);
  node(xO, yO, o, 22, 'scam?');
  ctx.fillStyle = C.ink; ctx.font = `600 13px ${C.mono}`; ctx.textAlign = 'center';
  ctx.fillText(Math.round(o * 100) + '%', xO, yO - 30);
}

export default function Neuron() {
  const C = useTokens();
  const reduce = useReducedMotion();
  const net = useRef(freshNet());
  const glow = useRef(freshGlow());
  const fadeFrame = useRef(0);
  const nextRound = useRef(0);
  const [inputs, setInputs] = useState([1, 0, 1]);
  // `net` is trained in place; this copy is what the readout renders.
  const [shown, setShown] = useState(freshNet);
  const [canvasRef, paint] = useCanvas((cv) => drawNet(cv, net.current, glow.current, inputs, C));

  useEffect(
    () => () => {
      cancelAnimationFrame(fadeFrame.current);
      clearTimeout(nextRound.current);
    },
    [],
  );

  const fade = () => {
    const lit = fadeGlow(glow.current);
    paint();
    fadeFrame.current = lit && !reduce ? requestAnimationFrame(fade) : 0;
  };
  const kick = () => {
    if (reduce) paint();
    else if (!fadeFrame.current) fadeFrame.current = requestAnimationFrame(fade);
  };
  const learn = () => {
    trainStep(net.current, glow.current);
    setShown(structuredClone(net.current));
    paint();
  };
  const learnOnce = () => {
    learn();
    kick();
  };
  const learn25 = () => {
    let n = 0;
    const go = () => {
      learn();
      if (++n < 25) nextRound.current = window.setTimeout(go, reduce ? 0 : 60);
      else kick();
    };
    go();
  };
  const forget = () => {
    net.current = freshNet();
    glow.current = freshGlow();
    setShown(freshNet());
    paint();
  };
  const toggle = (i: number) => setInputs((prev) => prev.map((v, k) => (k === i ? 1 - v : v)));

  const { o } = fwd(shown, inputs);
  const scam = inputs[0] + inputs[1] + inputs[2] >= 2;
  const correct = data.filter((d) => (fwd(shown, d.x).o > 0.5) === (d.t === 1)).length;

  return (
    <Plate id="neuron" no={1} scale="Zoom ×1 · a network small enough to see" title="Knowledge lives in the strength of connections">
      <div className="two">
        <div className="panel">
          <div className="controls" role="group" aria-label="Email features">
            <span className="mono muted">This email…</span>
            {QUESTIONS.map((label, i) => (
              <button key={label} className="btn" aria-pressed={inputs[i] === 1} onClick={() => toggle(i)}>
                {label}
              </button>
            ))}
          </div>
          <div className="canvas-box">
            <canvas ref={canvasRef} aria-label="A small neural network with three inputs, three hidden neurons and one output" />
          </div>
          <div className="controls">
            <button className="btn primary" onClick={learnOnce}>Learn from 8 examples</button>
            <button className="btn" onClick={learn25}>Learn 25 times</button>
            <button className="btn" onClick={forget}>Forget everything</button>
          </div>
          <div className="readout">
            Network says: <b>{Math.round(o * 100)}% scam</b> · right answer: <b>{scam ? 'scam' : 'not a scam'}</b> · correct on the 8 examples: <b>{correct}/8</b> · learning rounds: <b>{shown.steps}</b>
          </div>
        </div>
        <div className="prose">
          <p>This little network tries to guess whether an email is a scam. The rule it should discover is simple: two or more warning signs means scam. Nobody types that rule in. The network has to find it.</p>
          <p>Every line is a <b>weight</b>, a number that says how strongly one neuron pushes the next. <span style={{ color: 'var(--teal)' }}>Teal</span> lines push up, <span style={{ color: 'var(--rose)' }}>rose</span> lines push down, and thicker means stronger.</p>
          <p>Press <b>Learn</b>. The network looks at eight example emails, measures how wrong it was, and nudges every weight a little in the direction that would have made it less wrong. Lines that change flash amber. That nudge, repeated, is all "training" means.</p>
          <div className="callout"><p><b>The key idea:</b> change the weights and you change what the network "believes" and how it reasons. There is no separate file of facts. The knowledge is the pattern of weights.</p></div>
          <p className="muted">A real language model works the same way, except it has hundreds of billions of these lines and learns from trillions of words instead of eight emails.</p>
        </div>
      </div>
    </Plate>
  );
}
