import { Fragment } from 'react';

const SOURCES: [href: string, label: string][] = [
  ['https://www.anthropic.com/research/agentic-misalignment', 'Anthropic, Agentic Misalignment (June 2025)'],
  ['https://assets.anthropic.com/m/ec212e6566a0d47/original/Disrupting-the-first-reported-AI-orchestrated-cyber-espionage-campaign.pdf', 'Anthropic, AI-orchestrated cyber espionage report (Nov 2025)'],
  ['https://www.anthropic.com/research/emergent-misalignment-reward-hacking', 'Anthropic, emergent misalignment from reward hacking (Nov 2025)'],
  ['https://blog.cyberdesserts.com/ai-agent-security-risks/', 'AI agent security incidents 2026 roundup'],
  ['https://labs.cloudsecurityalliance.org/research/csa-research-note-indirect-prompt-injection-in-the-wild-2026/', 'Cloud Security Alliance, prompt injection in the wild (2026)'],
  ['https://www.ibtimes.sg/ai-agent-found-its-own-client-sold-work-got-paid-who-responsible-this-93900', 'IBTimes on Pip and iLands (Sept 2026)'],
  ['https://www.iea.org/news/ai-is-set-to-drive-surging-electricity-demand-from-data-centres-while-offering-the-potential-to-transform-how-the-energy-sector-works', 'IEA, Energy and AI (April 2025)'],
  ['https://wmo.int/media/news/wmo-report-documents-spiralling-weather-and-climate-impacts', 'WMO, State of the Global Climate 2024'],
];

export default function Footer() {
  return (
    <footer>
      <p>
        <b>Sources for plates 10–14:</b>{' '}
        {SOURCES.map(([href, label], i) => (
          <Fragment key={href}>
            {i > 0 && ' · '}
            <a href={href} target="_blank" rel="noopener">{label}</a>
          </Fragment>
        ))}
        . Sabrina, the future paths and the painting are illustrative.
      </p>
      <p>Model sizes are from the original publications (GPT-1, GPT-2, GPT-3, PaLM, Llama 3.1, DeepSeek-V3, Kimi K2). The task-length trend is from <a href="https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/" target="_blank" rel="noopener">METR's 2025 study</a>. The agent-shape scores, the world map and the cable lines are illustrative simplifications made for teaching, not measurements.</p>
    </footer>
  );
}
