import Plate from '../components/Plate.tsx';

const PUZZLES: [layer: string, question: string, text: string][] = [
  ['Connection points', 'Whose instructions count?', 'A web page can contain hidden text telling an agent to do something. Teaching agents to treat everything they read as information, not orders, is an unsolved security problem called prompt injection.'],
  ['Agent layer', 'Who checks the checker?', "When agents do thousands of steps, people can't review every one. We need trustworthy ways to verify work at machine speed."],
  ['Models', 'What is inside the weights?', 'We can measure what a model does, but reading why from its billions of weights is still early science. This field is called interpretability.'],
  ['Models', 'The echo problem', 'Models trained mostly on their own output can drift and narrow. Self-made data helps only when something real checks it.'],
  ['Physical layer', 'Power, water and land', 'Demand for electricity is rising fast. Who gets the power, and what it costs local communities, is becoming a political question.'],
  ['Compute & physical', 'Concentration', 'A few companies and countries control the chips and the biggest models. That shapes who benefits and who sets the rules.'],
  ['People', 'Is this a person or an agent?', 'As agents send emails, place orders and talk to each other, we need ways to tell who acted, and on whose behalf.'],
  ['People', 'Who is responsible?', 'If an agent makes a costly mistake, is it the user, the company that built it, or the business that deployed it? Laws are still catching up.'],
  ['People', 'Work and value', 'Agents are good at digital tasks first. How jobs change, and who captures the gains, is one of the biggest open questions of the decade.'],
];

export default function Puzzles() {
  return (
    <Plate id="puzzles" no={8} scale="Open questions · and which layer they live in" title="The puzzles nobody has fully solved">
      <div className="puzzles">
        {PUZZLES.map(([layer, question, text]) => (
          <div className="puz panel" key={question}>
            <span className="tag">{layer}</span>
            <h3>{question}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </Plate>
  );
}
