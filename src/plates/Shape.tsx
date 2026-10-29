import { Fragment, useState } from 'react';
import Plate from '../components/Plate.tsx';
import { alpha, useTokens } from '../lib/theme.ts';

const AXES = ['Task length', 'Tools reached', 'Independence', 'Memory', 'Teamwork', 'Real-world reach'];
const YEARS: { year: string; scores: number[]; text: string; probable?: boolean }[] = [
  { year: '2022', scores: [1, 1, 1, 1, 0.5, 0.5], text: 'Chatbots arrive. They answer one question at a time, can’t use tools, forget everything between chats, and take no actions.' },
  { year: '2024', scores: [3, 4, 3, 2, 2, 1.5], text: 'Models learn to call tools: search, code, files. Early agents can do a few steps on their own but lose track on longer jobs.' },
  { year: '2026', scores: [6, 7, 6, 5, 5, 3.5], text: 'Reasoning models think before acting. Coding and research agents work for hours, connect to thousands of tools through shared protocols, and teams of agents split up larger jobs.' },
  { year: '2028 · probable', scores: [8.5, 9, 8, 7.5, 8, 6], text: 'If trends hold: agents take on multi-day projects, carry long memory, and coordinate with other agents across companies. Physical-world reach, through robots and labs, grows more slowly.', probable: true },
];

function Radar({ year }: { year: number }) {
  const C = useTokens();
  const cx = 230, cy = 200, R = 135;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 6;
    return [cx + R * v / 10 * Math.cos(a), cy + R * v / 10 * Math.sin(a)];
  };
  const polygon = (scores: number[]) => scores.map((v, i) => pt(i, v).join(',')).join(' ');
  const Y = YEARS[year];
  const col = Y.probable ? C.amber : C.teal;
  return (
    <svg viewBox="0 0 460 400" role="img" aria-label="Six-direction shape of agent capability by year">
      {[2.5, 5, 7.5, 10].map((v) => (
        <polygon key={v} points={polygon(AXES.map(() => v))} fill="none" stroke={C.line} />
      ))}
      {AXES.map((axis, i) => {
        const [x, y] = pt(i, 10), [lx, ly] = pt(i, 11.6);
        return (
          <Fragment key={axis}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} />
            <text x={lx} y={ly + 4} textAnchor={Math.abs(lx - cx) < 10 ? 'middle' : lx > cx ? 'start' : 'end'} fill={C.ink} fontSize={11.5}>{axis}</text>
          </Fragment>
        );
      })}
      <polygon points={polygon(YEARS[0].scores)} fill={alpha(C.muted, 0.15)} stroke={C.muted} strokeWidth={1} />
      <polygon points={polygon(Y.scores)} fill={alpha(col, 0.22)} stroke={col} strokeWidth={2.5} strokeDasharray={Y.probable ? '6 5' : 'none'} />
      {Y.scores.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r={4} fill={col} />;
      })}
    </svg>
  );
}

export default function Shape() {
  const [year, setYear] = useState(2);
  return (
    <Plate id="shape" no={7} scale="Time · how the shape of an agent is stretching" title="Agents are growing in several directions at once">
      <div className="two">
        <div className="panel">
          <div className="controls years" role="group" aria-label="Choose a year">
            {YEARS.map((Y, i) => (
              <button key={Y.year} className="btn" aria-pressed={year === i} onClick={() => setYear(i)}>{Y.year}</button>
            ))}
          </div>
          <div className="svgbox"><Radar year={year} /></div>
          <div className="readout">Illustrative scores out of 10, drawn from public trends. Faint shape is 2022.</div>
        </div>
        <div className="prose">
          <h3>{YEARS[year].year}</h3>
          <p className="yeartext">{YEARS[year].text}</p>
          <p>"Changing dimension" for an agent means growing along these six directions: <b>how long</b> a task it can finish, <b>how many tools</b> it can reach, <b>how independently</b> it works, <b>how much it remembers</b>, <b>how many agents</b> cooperate, and <b>how far into the physical world</b> its actions reach.</p>
          <p>One research group, METR, measured that the length of tasks AI can finish on its own has been roughly doubling every seven months. If that continues even partly, agents move from minutes of work to days of work within a few years.</p>
          <div className="callout"><p>The shape matters more than any single number. An agent that is very smart but has no tools is limited. An agent with many tools but poor judgment is dangerous. Progress, and risk, come from all six growing together.</p></div>
        </div>
      </div>
    </Plate>
  );
}
