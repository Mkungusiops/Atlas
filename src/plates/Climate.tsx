import { Fragment, useState } from 'react';
import Plate from '../components/Plate.tsx';
import { useTokens, type ColorName } from '../lib/theme.ts';

const ELECTRICITY: [twh: number, label: string][] = [[415, '2024'], [945, '2030']];

const HORIZON: [color: ColorName, tag: string, title: string, text: string][] = [
  ['rose', 'Now · the 2020s', 'Strain you can see', 'New gas plants are being built or kept open to feed data centres. Local grids get tight, and water for cooling is a fight in dry regions. At the same time, CO₂ in the air rose by a record 3.5 ppm from 2023 to 2024, and is now about 52% above pre-industrial levels, the highest in at least 800,000 years.'],
  ['amber', 'Later · 2030s to 2050s', 'The budget runs out', 'Warming tracks the total CO₂ ever emitted. Every tonne added in this decade uses up the remaining budget for staying near 1.5–2 °C. Choices made now about how AI is powered set the floor for decades.'],
  ['violet', 'Long term · centuries', 'Reversal is slow', 'A large part of emitted CO₂ stays in the air for centuries, and some for thousands of years. Getting to net zero stops warming from rising. Bringing temperatures down means pulling CO₂ back out, at great cost. Sea-level rise keeps going for centuries either way.'],
  ['teal', 'The suitable way', 'Make AI pay its way in carbon', 'Build new data centres alongside new clean power, not on old fossil grids. Make chips and models more efficient. Run flexible jobs when wind and sun are strong. Put AI to work on grids, batteries and materials. The IEA says that, if used widely, this could offset the extra emissions from data centres.'],
];

function EnergyChart({ emissions }: { emissions: number }) {
  const C = useTokens();
  const B = 270, H = 200;
  const co2: [number, string][] = [[180, '2024'], [emissions, '2030 · your mix']];
  return (
    <svg viewBox="0 0 560 330" role="img" aria-label="Bar chart of data centre electricity 2024 and 2030 with the emissions that 2030 demand would cause at different grid mixes">
      <text x={20} y={26} fill={C.muted} fontSize={11}>ELECTRICITY (TWh)</text>
      <text x={300} y={26} fill={C.muted} fontSize={11}>CO₂ PER YEAR (MILLION TONNES)</text>
      {ELECTRICITY.map(([v, label], i) => {
        const x = 40 + i * 110, hh = v / 1000 * H;
        return (
          <Fragment key={label}>
            <rect x={x} y={B - hh} width={72} height={hh} fill={i ? C.violet : C.teal} rx={2} />
            <text x={x + 36} y={B - hh - 8} textAnchor="middle" fill={C.ink} fontSize={12} fontWeight={600}>{v}</text>
            <text x={x + 36} y={B + 18} textAnchor="middle" fill={C.muted} fontSize={11}>{label}</text>
          </Fragment>
        );
      })}
      <text x={40} y={B + 40} fill={C.muted} fontSize={10}>2030 is the IEA main projection</text>
      {co2.map(([v, label], i) => {
        const x = 320 + i * 110, hh = v / 450 * H;
        return (
          <Fragment key={label}>
            <rect x={x} y={B - hh} width={72} height={Math.max(hh, 1)} fill={i ? C.rose : C.muted} rx={2} />
            <text x={x + 36} y={B - hh - 8} textAnchor="middle" fill={C.ink} fontSize={12} fontWeight={600}>{Math.round(v)}</text>
            <text x={x + 36} y={B + 18} textAnchor="middle" fill={C.muted} fontSize={11}>{label}</text>
          </Fragment>
        );
      })}
      <line x1={20} x2={540} y1={B} y2={B} stroke={C.line} />
      <line x1={290} x2={290} y1={40} y2={B + 30} stroke={C.line} strokeDasharray="3 4" />
    </svg>
  );
}

export default function Climate() {
  const [clean, setClean] = useState(30);
  const share = clean / 100;
  // ~434 g CO₂/kWh for today's mix (IEA: 180 Mt / 415 TWh) and ~20 g for clean power.
  const emissions = 945 * (share * 20 + (1 - share) * 434) / 1000;

  return (
    <Plate id="climate" no={14} scale="Terawatt-hours · tonnes of CO₂ · centuries" title="Power, carbon and the climate">
      <div className="stats">
        <div className="stat panel"><span className="n">415 TWh</span><p>Electricity used by the world's data centres in 2024, about 1.5% of all electricity (IEA)</p></div>
        <div className="stat panel"><span className="n">945 TWh</span><p>Projected for 2030, close to 3% of the world's electricity and a bit more than all of Japan uses today (IEA)</p></div>
        <div className="stat panel"><span className="n" style={{ color: 'var(--rose)', fontSize: '1.9rem' }}>180 → 300 Mt</span><p>CO₂ from data-centre electricity now, rising to about 300 million tonnes by 2035 in the IEA's main case</p></div>
        <div className="stat panel"><span className="n" style={{ color: 'var(--amber)' }}>1.55 °C</span><p>Warming in 2024 above pre-industrial levels, likely the first calendar year above 1.5 °C (WMO)</p></div>
      </div>
      <div className="two">
        <div className="panel">
          <div className="svgbox"><EnergyChart emissions={emissions} /></div>
          <div className="slider">
            <label htmlFor="mix">Share of data-centre power from clean sources in 2030: <b>{Math.round(share * 100)}%</b></label>
            <input id="mix" type="range" min="0" max="100" step="1" value={clean} onChange={(e) => setClean(+e.target.value)} />
          </div>
          <div className="readout">
            At {Math.round(share * 100)}% clean power, 945 TWh would emit about <b>{Math.round(emissions)} million tonnes</b> of CO₂ a year, {emissions > 180 ? 'more than' : 'less than'} the ~180 Mt from data centres today.
          </div>
        </div>
        <div className="prose">
          <p>Every answer a model gives runs on electricity. Training a frontier model takes months on tens of thousands of chips, and serving it to hundreds of millions of people adds up over its lifetime.</p>
          <p>Globally, data centres are still a small slice of emissions. The IEA puts them at under 1.5% of the energy sector's total, even in 2035. But they are one of the fastest-growing slices, and they land in specific places. In the US, data centres are on course to drive almost half of all electricity-demand growth to 2030.</p>
          <p>Move the slider. The same 945 TWh can mean almost nothing for the climate or more than 400 million tonnes of CO₂ a year. It depends entirely on what generates the power.</p>
          <p className="muted">The slider uses a simplified estimate: about 434 g of CO₂ per kWh for today's mix (the IEA's 180 Mt divided by 415 TWh), and about 20 g for clean power.</p>
        </div>
      </div>
      <div className="horizon">
        {HORIZON.map(([color, tag, title, text]) => (
          <div className="hz panel" key={title}>
            <span className="tag" style={{ color: `var(--${color})` }}>{tag}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </Plate>
  );
}
