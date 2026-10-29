import { Fragment } from 'react';
import Plate from '../components/Plate.tsx';
import { useReducedMotion } from '../lib/hooks.ts';
import { alpha, useTokens } from '../lib/theme.ts';

const STEPS: [label: string, note: string, angle: number][] = [
  ['GOAL', 'what you asked for', -90],
  ['THINK', 'plan the next step', 0],
  ['ACT', 'use a tool', 90],
  ['OBSERVE', 'read the result', 180],
];
const TOOLS = ['web search', 'code runner', 'files', 'email', 'browser', 'payments*'];
const MEMORY = ['notes so far', 'past tasks', 'your preferences'];

function AgentLoop() {
  const C = useTokens();
  const reduce = useReducedMotion();
  const cx = 280, cy = 235, R = 150;
  const onRing = (deg: number) => {
    const r = deg * Math.PI / 180;
    return [cx + R * Math.cos(r), cy + R * Math.sin(r)];
  };
  return (
    <svg viewBox="0 0 560 470" role="img" aria-label="Agent loop: goal, think, act with a tool, observe the result, repeat">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.line} strokeWidth={2} strokeDasharray="4 6" />
      <circle cx={cx} cy={cy} r={58} fill={C.wash} stroke={C.teal} strokeWidth={2} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={C.ink} fontSize={14} fontWeight={600}>MODEL</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={C.muted} fontSize={10.5}>the weights</text>
      {STEPS.map(([label, note, deg]) => {
        const [x, y] = onRing(deg);
        return (
          <Fragment key={label}>
            <circle cx={x} cy={y} r={34} fill={C.panel} stroke={C.amber} strokeWidth={2} />
            <text x={x} y={y + 4} textAnchor="middle" fill={C.ink} fontSize={11.5} fontWeight={600}>{label}</text>
            <text x={x} y={deg === -90 ? y - 44 : y + 52} textAnchor="middle" fill={C.muted} fontSize={10.5}>{note}</text>
          </Fragment>
        );
      })}
      {[-45, 45, 135, 225].map((deg) => {
        const [x, y] = onRing(deg);
        return <path key={deg} d="M -7 -6 L 5 0 L -7 6 Z" fill={C.amber} transform={`translate(${x},${y}) rotate(${deg + 90})`} />;
      })}
      <text x={14} y={30} fill={C.teal} fontSize={11} fontWeight={600}>TOOLS (HANDS)</text>
      {TOOLS.map((t, i) => <text key={t} x={14} y={48 + i * 16} fill={C.muted} fontSize={10.5}>{t}</text>)}
      <text x={546} y={30} textAnchor="end" fill={C.teal} fontSize={11} fontWeight={600}>MEMORY</text>
      {MEMORY.map((t, i) => <text key={t} x={546} y={48 + i * 16} textAnchor="end" fill={C.muted} fontSize={10.5}>{t}</text>)}
      <rect x={14} y={418} width={532} height={38} rx={4} fill={alpha(C.rose, 0.12)} stroke={C.rose} />
      <text x={280} y={442} textAnchor="middle" fill={C.ink} fontSize={11}>GUARDRAILS · *ask a human before money, deletions or messages</text>
      {!reduce && (
        <circle r={7} fill={C.teal}>
          <animateMotion dur="6s" repeatCount="indefinite" path={`M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R}`} />
        </circle>
      )}
    </svg>
  );
}

export default function Agent() {
  return (
    <Plate id="agent" no={4} scale="One loop · repeated until the job is done" title="An agent is a model given hands, memory and a goal">
      <div className="two">
        <div className="panel svgbox"><AgentLoop /></div>
        <div className="prose">
          <p>A chatbot answers once. An <b>agent</b> works in a loop. It reads a goal, thinks about the next step, uses a tool (search the web, run code, open a file, send an email), looks at what happened, and goes around again. It stops when the goal is met or it needs a human.</p>
          <p>The model is the brain. Everything around it, the tools, the memory, the permissions, is called the <b>harness</b>. Two agents built on the same model can behave very differently depending on their harness.</p>
          <p>Power comes from three things: how good the model's reasoning is, how many tools it can reach, and how long it can keep going without getting lost.</p>
          <div className="callout warn"><p><b>Guardrails sit between the loop and the world.</b> Good agents ask permission before irreversible actions such as payments, deletions or sending messages, and they treat text they read online as information, never as orders.</p></div>
        </div>
      </div>
    </Plate>
  );
}
