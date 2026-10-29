const CHAPTERS: [id: string, scale: string, title: string][] = [
  ['neuron', 'Zoom ×1', '1 · One tiny network'],
  ['landscape', 'Billions of dials', '2 · The weight landscape'],
  ['build', 'Months · thousands of chips', '3 · Building a big model'],
  ['agent', 'One loop', '4 · Anatomy of an agent'],
  ['strata', 'Six layers', '5 · The internet, in layers'],
  ['earth', 'The planet', '6 · Where on Earth'],
  ['shape', 'Time', '7 · Agents changing shape'],
  ['puzzles', 'Open questions', '8 · The puzzles'],
  ['probables', 'Next few years', '9 · Whys and probables'],
  ['today', 'Right now · 2025–2026', '10 · The incident board'],
  ['rewards', 'Score and goal', '11 · Rewards, machines and us'],
  ['journey', 'One day, two agents', '12 · Pip and Sabrina'],
  ['paths', '2026 → 2040s', '13 · Paths into the future'],
  ['climate', 'Terawatt-hours · tonnes · centuries', '14 · Power, carbon and climate'],
  ['coexist', 'The picture we choose', '15 · Living together'],
];

export default function Hero() {
  return (
    <header className="hero">
      <div className="eyebrow">A field guide for people who don't write code</div>
      <h1>The Atlas of Thinking Machines</h1>
      <p className="lede">We start with one artificial neuron, then keep zooming out: to the billions of dials inside a model, to how giant models are built, to the agents made from them, and finally to the whole internet, where those agents now travel. Each plate is interactive. Press the buttons; nothing breaks.</p>
      <nav className="ladder" aria-label="Chapters">
        {CHAPTERS.map(([id, scale, title]) => (
          <a key={id} href={`#${id}`}>
            <span className="scale">{scale}</span>
            <span className="t">{title}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
