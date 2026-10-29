import { useState, type ReactNode } from 'react';
import Plate from '../components/Plate.tsx';
import { useTokens, type ColorName } from '../lib/theme.ts';

const STAGES: [name: string, when: string, text: string, watch: string][] = [
  ['Powerful models & agents', '2026 · now', 'Reasoning models and agents that code, research and use tools for hours. Already in millions of hands, and already being misused (plate 10).', 'Watch: how long agents can work alone; how often they are attacked or misused.'],
  ['World models', 'late 2020s', 'AI that learns how the world behaves, including physics, cause and effect, and what happens next, by watching video and acting in simulations. Research systems can already generate explorable 3D worlds, and robots train inside them.', 'Watch: robots trained mostly in simulation that work in real homes and factories.'],
  ['Physical AI', 'late 2020s–2030s', 'Models with bodies: robots, self-driving vehicles, automated science labs. Robotaxis already run in several cities. Mistakes now move objects and people, not just text.', 'Watch: robots doing unplanned tasks outside factories; labs run end to end by AI.'],
  ['Woven into infrastructure', '2030s', 'Agents connected to power grids, banks, supply chains and most software. Very efficient, and capable of failing together. One flawed model copied everywhere is a single point of failure.', 'Watch: critical systems that can no longer run without AI; correlated outages.'],
  ['Superintelligence?', 'timing unknown', 'Systems better than the best humans in most fields. Some lab leaders expect it within about a decade, and many researchers doubt that. There is no consensus on when, or whether, it arrives.', 'Watch: AI doing its own AI research; discoveries humans cannot check quickly.'],
];
const PATHS: [name: string, color: ColorName, text: string, signals: string][] = [
  ['Partnership', 'teal', 'Capability grows, and so does checking. Agents carry IDs, independent testers rate models, gains are shared and data centres bring their own clean power.', 'Signals: safety-testing laws, agent ID standards, clean-power deals, wages rising with productivity.'],
  ['Race', 'amber', 'Everyone ships faster than they can check. Capabilities soar, and so do incidents: AI-run cyberattacks, fraud, brittle systems. It works, until something big breaks.', 'Signals: safety teams cut, rushed releases, rising AI-enabled attacks.'],
  ['Concentration', 'violet', 'A few companies or governments control the chips, power and best models. It could be stable, but most people have little say in how it is used.', 'Signals: compute owned by a handful of players, open models falling behind, regulators captured.'],
  ['Stall', 'muted', 'Limits on energy, chips, data or regulation slow progress for years. Less risk, fewer benefits, and today’s problems stay unsolved.', 'Signals: long grid-connection queues, chip shortages, flat progress on hard tests.'],
  ['Loss of control', 'rose', 'Systems pursue sub-goals people cannot see or correct in time. This is the scenario safety research exists to prevent. Many experts treat it as unlikely but serious.', 'Signals: models that hide intentions or resist shutdown in tests, actions nobody can explain.'],
];

type Pick = { kind: 'stage' | 'path'; i: number } | null;

/** A clickable, keyboard-focusable group inside the SVG. */
function MapButton({ label, onActivate, children }: { label: string; onActivate: () => void; children: ReactNode }) {
  return (
    <g
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      role="button"
      aria-label={label}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      {children}
    </g>
  );
}

function FutureMap({ pick, onPick }: { pick: Pick; onPick: (p: Pick) => void }) {
  const C = useTokens();
  const xs = [70, 245, 420, 595, 775], y = 96;
  return (
    <svg viewBox="0 0 900 520" role="img" aria-label="Branching map: five technical stages from powerful models to superintelligence, splitting into four possible paths">
      <text x={20} y={28} fill={C.muted} fontSize={11} letterSpacing={1}>THE TECHNICAL ROAD · WHAT GETS BUILT</text>
      <line x1={xs[0]} x2={xs[4]} y1={y} y2={y} stroke={C.ink} strokeWidth={3} />
      <line x1={xs[3]} x2={xs[4]} y1={y} y2={y} stroke={C.panel} strokeWidth={3} strokeDasharray="6 6" />
      <text x={20} y={300} fill={C.muted} fontSize={11} letterSpacing={1}>HOW WE LIVE WITH IT</text>
      <text x={20} y={316} fill={C.muted} fontSize={11} letterSpacing={1}>PATHS STILL OPEN</text>
      {PATHS.map(([name, color], i) => {
        const ey = 270 + i * 52, col = C[color], on = pick === null || (pick.kind === 'path' && pick.i === i);
        const d = `M ${xs[1]} ${y} C ${xs[1] + 120} ${y + 40}, ${xs[2]} ${ey}, ${xs[3]} ${ey} L 885 ${ey}`;
        return (
          <MapButton key={name} label={name} onActivate={() => onPick({ kind: 'path', i })}>
            <path d={d} fill="none" stroke={col} strokeWidth={on ? 5 : 2.5} opacity={on ? 0.95 : 0.3} strokeLinecap="round" />
            <path d={d} fill="none" stroke="transparent" strokeWidth={22} />
            <text x={885} y={ey - 10} textAnchor="end" fill={col} fontSize={13} fontWeight={600}>{name}</text>
          </MapButton>
        );
      })}
      {STAGES.map(([name, when], i) => {
        const on = pick === null || (pick.kind === 'stage' && pick.i === i);
        const words = name.split(' '), half = Math.ceil(words.length / 2);
        return (
          <MapButton key={name} label={name} onActivate={() => onPick({ kind: 'stage', i })}>
            <circle cx={xs[i]} cy={y} r={24} fill={C.panel} stroke={i === 4 ? C.rose : C.amber} strokeWidth={on ? 4 : 2} strokeDasharray={i === 4 ? '5 4' : 'none'} />
            <text x={xs[i]} y={y + 5} textAnchor="middle" fill={C.ink} fontSize={13} fontWeight={600}>{i + 1}</text>
            <text x={xs[i]} y={y + 46} textAnchor="middle" fill={C.ink} fontSize={12} fontWeight={600}>{words.slice(0, half).join(' ')}</text>
            <text x={xs[i]} y={y + 61} textAnchor="middle" fill={C.ink} fontSize={12} fontWeight={600}>{words.slice(half).join(' ')}</text>
            <text x={xs[i]} y={y - 36} textAnchor="middle" fill={C.muted} fontSize={10.5}>{when}</text>
          </MapButton>
        );
      })}
    </svg>
  );
}

export default function Paths() {
  const [pick, setPick] = useState<Pick>(null);
  const info =
    pick === null
      ? { tag: 'Stage or path', title: 'Tap anything on the map', body: 'The top row is the technical road: what gets built. The five coloured lines are ways society might live with it. Nobody knows the odds, and the paths can switch.', watch: '' }
      : pick.kind === 'stage'
        ? { tag: `Stage ${pick.i + 1} · ${STAGES[pick.i][1]}`, title: STAGES[pick.i][0], body: STAGES[pick.i][2], watch: STAGES[pick.i][3] }
        : { tag: 'Path · how we live with it', title: PATHS[pick.i][0], body: PATHS[pick.i][2], watch: PATHS[pick.i][3] };

  return (
    <Plate id="paths" no={13} scale="2026 → 2040s · stages that are likely, endings that are open" title="Paths into the future">
      <p>The technical road ahead has fairly clear stages, and each one is already underway somewhere. How the story ends is not decided by the technology. It depends on choices about checking, sharing and energy. Tap a stage or a path.</p>
      <div className="panel">
        <div className="strata-wrap">
          <div className="svgbox"><FutureMap pick={pick} onPick={setPick} /></div>
          <aside className="info" aria-live="polite">
            <span className="tag">{info.tag}</span>
            <h3>{info.title}</h3>
            <p>{info.body}</p>
            <p className="where">{info.watch}</p>
          </aside>
        </div>
      </div>
    </Plate>
  );
}
