import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Key from '../components/Key.tsx';
import Plate from '../components/Plate.tsx';
import { fit, useCanvas } from '../lib/canvas.ts';
import { useLatest, useReducedMotion } from '../lib/hooks.ts';
import { alpha, useTokens, type ColorName, type Tokens } from '../lib/theme.ts';

type Pt = [number, number];
type StrataNode = { id: string; label: string; body: string; where: string; layer: string; li: number; i: number; n: number };
type Info = { tag: string; title: string; body: string; where: string };

const LAYERS: { name: string; nodes: [id: string, label: string, body: string, where: string][] }[] = [
  { name: 'People & organizations', nodes: [
    ['you', 'You', 'A person giving an agent a goal in plain language: "find me a flight", "summarize these files".', 'Everywhere with a phone or laptop.'],
    ['biz', 'Businesses', 'Companies deploy agents for customer service, accounting, sales and research.', 'Every industry; banks, retailers and software firms lead adoption.'],
    ['dev', 'Developers', 'People who build agents and increasingly use coding agents to write software.', 'Concentrated in tech hubs, but spreading fast worldwide.'],
    ['gov', 'Governments', 'Write the rules on data, safety and liability, and buy AI themselves.', 'The EU AI Act, US policy, China, and many countries drafting their own rules.'],
  ] },
  { name: 'Connection points', nodes: [
    ['web', 'Websites', 'Agents visit sites through browsers just like people, reading pages and filling in forms.', 'The open web; billions of pages.'],
    ['api', 'APIs', 'Direct machine-to-machine doors into services: weather, maps, banking, shipping.', 'Run by almost every online company.'],
    ['mail', 'Email & chat', 'Agents read and draft messages, and some operate inside team chat tools.', 'Email providers and workplace chat platforms.'],
    ['repo', 'Code repositories', 'Where software lives. Coding agents read, change and test it here.', 'Large public code hosts plus private company servers.'],
    ['pay', 'Payments', 'Card networks and digital wallets. The most sensitive connection point.', 'Card networks, banks and mobile money systems.'],
    ['db', 'Files & databases', 'Company records, spreadsheets and documents agents search and update.', 'Cloud storage and company servers.'],
  ] },
  { name: 'Agents', nodes: [
    ['chat', 'Chat assistants', 'The assistants people talk to directly, increasingly able to take actions.', 'Apps and websites from the major AI labs.'],
    ['code', 'Coding agents', 'Agents that write, run and fix software, often for hours at a time.', 'Inside developer tools and terminals.'],
    ['brow', 'Browser agents', 'Agents that see and click web pages like a person would.', 'Built into browsers and AI apps.'],
    ['proto', 'Protocols', 'Shared plug standards, such as the Model Context Protocol, so any agent can connect to any tool the same way.', 'Open standards adopted across many companies.'],
    ['orch', 'Orchestrators', 'A lead agent that splits a big job among several helper agents and combines the results.', 'Company back offices and research systems.'],
  ] },
  { name: 'Models', nodes: [
    ['front', 'Frontier models', 'The most capable closed models from a handful of labs. The "brains" most agents call.', 'Mostly US labs, plus a few in China and elsewhere.'],
    ['open', 'Open-weight models', 'Models whose weights are published so anyone can run or modify them.', 'Strong releases from China, the US, France and others.'],
    ['small', 'Small models', 'Compact, fast models, often distilled from big ones, that can run on phones and laptops.', 'On your own device.'],
  ] },
  { name: 'Compute', nodes: [
    ['cloud', 'Cloud platforms', 'Rented computing from a few giant providers. Most models are served from here.', 'Run by a handful of companies in the US and China.'],
    ['gpu', 'AI chip clusters', 'Tens of thousands of specialized chips wired together to train and run models.', 'Inside the biggest data centers.'],
    ['edge', 'Phones & laptops', 'Your own device, increasingly with chips built for running AI locally.', 'In your pocket.'],
  ] },
  { name: 'Physical ground', nodes: [
    ['dc', 'Data centers', 'Warehouse-sized buildings full of computers, cooling and backup power.', 'Northern Virginia is the largest cluster on Earth; also Ireland, Singapore, the Gulf and more.'],
    ['power', 'Power grid', 'A large AI data center needs as much electricity as a small city.', 'Grids, gas plants, nuclear and renewables near data centers.'],
    ['cable', 'Undersea cables', 'Fiber-optic cables on the sea floor carry almost all traffic between continents.', 'Hundreds of cables; several new ones land in West, East and South Africa.'],
    ['fab', 'Chip factories', 'The most advanced AI chips come from very few factories.', 'Taiwan leads; key machines from the Netherlands; memory from South Korea.'],
  ] },
];

const NODES: StrataNode[] = LAYERS.flatMap((layer, li) =>
  layer.nodes.map(([id, label, body, where], i) => ({ id, label, body, where, layer: layer.name, li, i, n: layer.nodes.length })),
);
const NODE: Record<string, StrataNode> = Object.fromEntries(NODES.map((n) => [n.id, n]));

const JOURNEYS: { name: string; color: ColorName; path: string[]; note: string }[] = [
  { name: 'Book a trip', color: 'teal', path: ['you', 'chat', 'front', 'gpu', 'dc', 'gpu', 'front', 'brow', 'web', 'pay', 'you'],
    note: 'The model does the thinking in a data center; the agent does the clicking on websites; it should stop to ask you before paying.' },
  { name: 'Fix a software bug', color: 'amber', path: ['dev', 'code', 'front', 'cloud', 'front', 'code', 'proto', 'repo', 'dev'],
    note: 'The agent edits code, runs tests in the cloud and shows the developer what changed.' },
  { name: 'Run a back office', color: 'rose', path: ['biz', 'orch', 'open', 'cloud', 'dc', 'cloud', 'orch', 'db', 'mail', 'biz'],
    note: 'A lead agent splits the job, helpers read records and draft emails, and staff approve what goes out.' },
  { name: 'Agent meets agent', color: 'violet', path: ['biz', 'orch', 'proto', 'chat', 'api', 'proto', 'orch', 'biz'],
    note: 'Two companies’ agents talk through a shared protocol. Each must check who the other one is acting for.' },
];

const INTRO: Info = {
  tag: 'Tap a node',
  title: 'Every job crosses several layers',
  body: 'A request you type travels down to a data center, comes back up as a plan, then goes out sideways to websites, files and payment systems. Choose a job above to watch one route.',
  where: '',
};

function npos(n: StrataNode, w: number, h: number): Pt {
  const top = 34, lh = (h - top - 10) / 6;
  return [w * (n.i + 1) / (n.n + 1) + (n.li % 2 ? w * 0.03 : -w * 0.02), top + lh * n.li + lh * 0.48];
}

/** Draws the six layers, the job routes and the moving packets; returns the canvas size for hit-testing. */
function drawStrata(cv: HTMLCanvasElement, C: Tokens, sel: number, active: string | null, prog: number[], reduce: boolean) {
  const { ctx, w, h } = fit(cv, 0.72, 640, 560);
  const top = 34, lh = (h - top - 10) / 6, small = w < 560;
  const at = (n: StrataNode) => npos(n, w, h);

  LAYERS.forEach((layer, li) => {
    const y = top + lh * li;
    ctx.fillStyle = li % 2 ? alpha(C.wash, 0.55) : alpha(C.wash, 0.15);
    ctx.fillRect(0, y, w, lh);
    ctx.strokeStyle = C.line;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillStyle = C.muted; ctx.font = `600 ${small ? 9 : 10}px ${C.mono}`; ctx.textAlign = 'left';
    ctx.fillText(`${li + 1} · ${layer.name.toUpperCase()}`, 8, y + 13);
  });
  ctx.fillStyle = C.muted; ctx.font = `10px ${C.mono}`; ctx.textAlign = 'right';
  ctx.fillText('SURFACE ↑', w - 8, 20);

  // faint mesh between adjacent layers
  ctx.strokeStyle = alpha(C.muted, 0.12); ctx.lineWidth = 1;
  for (const a of NODES) for (const b of NODES) {
    if (b.li === a.li + 1 && Math.abs((a.i + 1) / (a.n + 1) - (b.i + 1) / (b.n + 1)) < 0.3) {
      const p = at(a), q = at(b);
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
    }
  }

  // journey routes
  JOURNEYS.forEach((J, ji) => {
    const on = sel === -1 || sel === ji, o = (ji - 1.5) * 3;
    ctx.strokeStyle = alpha(C[J.color], on ? (sel === -1 ? 0.45 : 0.9) : 0.07);
    ctx.lineWidth = on && sel !== -1 ? 3 : 1.8;
    ctx.beginPath();
    J.path.forEach((id, k) => {
      const [x, y] = at(NODE[id]);
      if (k) ctx.lineTo(x + o, y + o);
      else ctx.moveTo(x + o, y + o);
    });
    ctx.stroke();
  });

  // nodes
  const route = sel >= 0 ? JOURNEYS[sel] : null;
  for (const n of NODES) {
    const [x, y] = at(n);
    const isActive = active === n.id;
    ctx.fillStyle = C.panel;
    ctx.strokeStyle = isActive ? C.amber : route?.path.includes(n.id) ? C[route.color] : C.ink;
    ctx.lineWidth = isActive ? 3 : 1.5;
    ctx.beginPath(); ctx.arc(x, y, small ? 8 : 10, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.font = `${small ? 9.5 : 11}px ${C.mono}`; ctx.textAlign = 'center';
    const words = n.label.split(' ');
    if (small && words.length > 1) {
      const half = Math.ceil(words.length / 2);
      ctx.fillText(words.slice(0, half).join(' '), x, y + 21);
      ctx.fillText(words.slice(half).join(' '), x, y + 32);
    } else {
      ctx.fillText(n.label, x, y + (small ? 21 : 25));
    }
  }

  // packets
  JOURNEYS.forEach((J, ji) => {
    if (sel !== -1 && sel !== ji) return;
    const segs = J.path.length - 1, f = (reduce ? 0.5 : prog[ji]) * segs;
    const k = Math.min(segs - 1, Math.floor(f)), u = f - k;
    const a = at(NODE[J.path[k]]), b = at(NODE[J.path[k + 1]]), o = (ji - 1.5) * 3;
    const x = a[0] + (b[0] - a[0]) * u + o, y = a[1] + (b[1] - a[1]) * u + o;
    ctx.fillStyle = alpha(C[J.color], 0.25); ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill();
    ctx.fillStyle = C[J.color]; ctx.beginPath(); ctx.arc(x, y, 5.5, 0, 7); ctx.fill();
  });

  return { w, h };
}

export default function Strata() {
  const C = useTokens();
  const reduce = useReducedMotion();
  const [sel, setSel] = useState(-1);
  const [active, setActive] = useState<string | null>(null);
  const [info, setInfo] = useState(INTRO);
  const prog = useRef(JOURNEYS.map((_, i) => i * 0.25));
  const size = useRef({ w: 0, h: 0 });
  const selRef = useLatest(sel);
  const [canvasRef, paint] = useCanvas((cv) => {
    size.current = drawStrata(cv, C, sel, active, prog.current, reduce);
  });

  useEffect(() => {
    if (reduce) return;
    let frame = 0, last = 0;
    const loop = (ts: number) => {
      const dt = Math.min(50, ts - (last || ts));
      last = ts;
      prog.current = prog.current.map((p, i) => (p + dt * 0.000055 * (selRef.current === i ? 1.6 : 1)) % 1);
      paint();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reduce, paint, selRef]);

  const pickNode = (e: MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best: StrataNode | undefined;
    let bd = 24;
    for (const n of NODES) {
      const [x, y] = npos(n, size.current.w, size.current.h);
      const d = Math.hypot(x - mx, y - my);
      if (d < bd) { bd = d; best = n; }
    }
    if (!best) return;
    setActive(best.id);
    setInfo({ tag: `Layer ${best.li + 1} · ${best.layer}`, title: best.label, body: best.body, where: 'Where: ' + best.where });
  };

  const chooseJourney = (j: number) => {
    setSel(j);
    if (j < 0) return;
    const J = JOURNEYS[j];
    setInfo({ tag: 'Journey', title: J.name, body: 'Route: ' + J.path.map((id) => NODE[id].label).join(' → '), where: J.note });
  };

  return (
    <Plate id="strata" no={5} scale="Six layers · from concrete and copper to people" title="Where agents live on the internet">
      <p>Think of the internet like the ground beneath a city. People sit on the surface. Underneath are the places agents connect to, then the agents themselves, then the models, then giant computers, and at the bottom, physical things: buildings, power and cables. The moving dots are agents carrying out real kinds of jobs. Tap any node to learn what it is and where it sits.</p>
      <div className="panel">
        <div className="controls journeys" role="group" aria-label="Choose a journey">
          <span className="mono muted">Follow a job:</span>
          <button className="btn" aria-pressed={sel === -1} onClick={() => chooseJourney(-1)}>All at once</button>
          {JOURNEYS.map((J, j) => (
            <button key={J.name} className="btn" aria-pressed={sel === j} onClick={() => chooseJourney(j)}>{J.name}</button>
          ))}
        </div>
        <div className="strata-wrap">
          <div className="canvas-box">
            <canvas ref={canvasRef} aria-label="Layered map of the internet showing where agents connect" style={{ cursor: 'pointer' }} onClick={pickNode} />
          </div>
          <aside className="info" aria-live="polite">
            <span className="tag">{info.tag}</span>
            <h3>{info.title}</h3>
            <p>{info.body}</p>
            <p className="where">{info.where}</p>
          </aside>
        </div>
      </div>
      <Key items={[['teal', 'Book a trip'], ['amber', 'Fix a bug'], ['rose', 'Back office'], ['violet', 'Agent meets agent']]} />
    </Plate>
  );
}
