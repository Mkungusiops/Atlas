import { Fragment } from 'react';
import Facts from '../components/Facts.tsx';
import Plate from '../components/Plate.tsx';
import { useTokens } from '../lib/theme.ts';

const STAGES: [stage: string, title: string, text: string][] = [
  ['Stage A', 'Gather', 'Collect huge amounts of text, code, images and more. Clean out junk and duplicates.'],
  ['Stage B', 'Pre-train', 'Show it text and ask it to predict the next word, trillions of times. This builds general knowledge.'],
  ['Stage C', 'Fine-tune', 'Train on examples of good answers so it behaves like a helpful assistant.'],
  ['Stage D', 'Feedback', 'People, and other AI models, rate answers. The model is pushed toward the better ones.'],
  ['Stage E', 'Practice reasoning', 'It solves checkable problems, like math and code, thinking step by step. Correct paths are rewarded.'],
  ['Stage F', 'Test & release', 'Safety and capability testing, then release to the public through apps and APIs.'],
];

const MODELS: [name: string, year: string, weights: number][] = [
  ['GPT-1', '2018', 1.17e8], ['GPT-2', '2019', 1.5e9], ['GPT-3', '2020', 1.75e11], ['PaLM', '2022', 5.4e11],
  ['Llama 3.1', '2024', 4.05e11], ['DeepSeek-V3', '2024', 6.71e11], ['Kimi K2', '2025', 1e12],
];
const TICKS: [number, string][] = [[1e8, '100M'], [1e9, '1B'], [1e10, '10B'], [1e11, '100B'], [1e12, '1T']];

function fmt(v: number) {
  return v >= 1e12 ? v / 1e12 + ' trillion' : v >= 1e9 ? +(v / 1e9).toFixed(1) + ' billion' : v / 1e6 + ' million';
}

function ScaleChart() {
  const C = useTokens();
  const x0 = 150, x1 = 520, lo = 8, hi = 12.3;
  const X = (v: number) => x0 + (Math.log10(v) - lo) / (hi - lo) * (x1 - x0);
  return (
    <svg viewBox="0 0 640 330" role="img" aria-label="Bar chart of published model sizes on a log scale">
      <text x={16} y={24} fill={C.muted} fontSize={11}>PUBLISHED MODEL SIZE · NUMBER OF WEIGHTS (LOG SCALE)</text>
      {TICKS.map(([v, t]) => (
        <Fragment key={t}>
          <line x1={X(v)} x2={X(v)} y1={40} y2={300} stroke={C.line} strokeWidth={1} />
          <text x={X(v)} y={318} fill={C.muted} fontSize={11} textAnchor="middle">{t}</text>
        </Fragment>
      ))}
      {MODELS.map(([name, year, weights], i) => {
        const y = 50 + i * 36;
        return (
          <Fragment key={name}>
            <text x={16} y={y + 14} fill={C.ink} fontSize={12} fontWeight={600}>{name}</text>
            <text x={16} y={y + 28} fill={C.muted} fontSize={10}>{year}</text>
            <rect x={x0} y={y + 4} width={X(weights) - x0} height={16} fill={i >= 5 ? C.violet : C.teal} rx={2} />
            <text x={X(weights) + 6} y={y + 16} fill={C.ink} fontSize={10.5}>{fmt(weights)}</text>
          </Fragment>
        );
      })}
    </svg>
  );
}

export default function Build() {
  return (
    <Plate id="build" no={3} scale="Months of work · thousands of chips" title={'How a big model, and then a "super model", gets built'}>
      <div className="pipe">
        {STAGES.map(([stage, title, text]) => (
          <div className="step panel" key={stage}>
            <span className="mono">{stage}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="two">
        <div className="panel svgbox"><ScaleChart /></div>
        <div className="prose">
          <p>Each step on the chart's scale is ten times bigger than the last. In seven years, publicly described model sizes grew roughly ten-thousand-fold.</p>
          <p>The companies with the biggest closed models (often called frontier models) mostly don't publish their sizes anymore, so they are not on this chart.</p>
          <p className="muted">For the largest recent open models, only a fraction of the weights is used for each word. This design is called a "mixture of experts": many specialist sub-networks, with a router picking a few for each word.</p>
        </div>
      </div>
      <Facts
        items={[
          ['Teacher and student', 'A giant model can generate examples to train a smaller, faster one. This is called distillation, and it is why fast cheap models keep improving.'],
          ['Thinking time', 'Newer models can "think longer" before answering. Spending more computing at answer time is a second way to get smarter, besides just making the model bigger.'],
          ['Self-made data', "Where answers can be checked (math, code, games), models generate their own practice and keep only the verified results. Where they can't be checked, real-world data still matters."],
        ]}
      />
    </Plate>
  );
}
