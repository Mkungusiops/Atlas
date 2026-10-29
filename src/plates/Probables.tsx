import Plate from '../components/Plate.tsx';
import type { ColorName } from '../lib/theme.ts';

const WHYS: [title: string, text: string][] = [
  ['Models can teach themselves where answers are checkable', 'Math and code let models practice without waiting for more human writing, which is why reasoning has jumped.'],
  ['Thinking longer works', 'Giving a model more time to reason at answer time is a second dial for intelligence, on top of model size.'],
  ['Plugging in got easy', 'Shared standards such as the Model Context Protocol let one agent connect to thousands of tools the same way.'],
  ['Money and competition', 'Companies and governments are spending hundreds of billions of dollars on chips and data centers, and racing each other.'],
];

const OUTLOOK: { label: string; color: ColorName; odds: number; items: string[] }[] = [
  { label: 'Likely', color: 'teal', odds: 80, items: [
    'Agents routinely handle multi-hour computer tasks such as research, coding, paperwork and booking.',
    'A growing share of web traffic comes from agents, not people clicking.',
    'More training data is generated and checked by machines rather than written by humans.',
    'Energy and chip supply become central political issues.',
  ] },
  { label: 'Plausible', color: 'amber', odds: 55, items: [
    'Personal agents that remember your preferences for months and act for you across apps.',
    "Agents negotiating and trading with other companies' agents.",
    'Capable small models running privately on phones.',
    'New rules requiring agents to identify themselves.',
  ] },
  { label: 'Genuinely uncertain', color: 'rose', odds: 30, items: [
    "Whether reasoning gains carry over to messy real-world judgment, where answers can't be checked.",
    'Whether safety and verification keep pace with capability.',
    'How work, wages and wealth shift.',
    'Whether the benefits spread widely or stay concentrated.',
  ] },
];

export default function Probables() {
  return (
    <Plate id="probables" no={9} scale="The next few years · my reading, not a prophecy" title="The whys, and the probables">
      <h3>Why it's moving this fast</h3>
      <div className="whys">
        {WHYS.map(([title, text]) => (
          <div className="why panel" key={title}>
            <b>{title}</b>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="prob">
        {OUTLOOK.map(({ label, color, odds, items }) => (
          <div className="col panel" key={label}>
            <span className="tag" style={{ color: `var(--${color})` }}>{label}</span>
            <div className="meter"><span style={{ width: `${odds}%`, background: `var(--${color})` }} /></div>
            <ul>
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="callout"><p><b>The one-sentence version:</b> a neural network's beliefs are its weights; training moves those weights; agents wrap the result in tools and a loop; and those loops are now spreading across every layer of the internet, faster where answers can be checked and slower where only the real world can say what's true.</p></div>
    </Plate>
  );
}
