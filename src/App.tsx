import { useEffect } from 'react';
import Footer from './components/Footer.tsx';
import Hero from './components/Hero.tsx';
import Agent from './plates/Agent.tsx';
import Build from './plates/Build.tsx';
import Climate from './plates/Climate.tsx';
import Coexist from './plates/Coexist.tsx';
import Earth from './plates/Earth.tsx';
import Journey from './plates/Journey.tsx';
import Landscape from './plates/Landscape.tsx';
import Neuron from './plates/Neuron.tsx';
import Paths from './plates/Paths.tsx';
import Probables from './plates/Probables.tsx';
import Puzzles from './plates/Puzzles.tsx';
import Rewards from './plates/Rewards.tsx';
import Shape from './plates/Shape.tsx';
import Strata from './plates/Strata.tsx';
import Today from './plates/Today.tsx';

export default function App() {
  useEffect(() => {
    // The plates mount after the browser's own jump to a #fragment, so repeat it once they exist.
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <div className="wrap">
      <Hero />
      <Neuron />
      <Landscape />
      <Build />
      <Agent />
      <Strata />
      <Earth />
      <Shape />
      <Puzzles />
      <Probables />
      <Today />
      <Rewards />
      <Journey />
      <Paths />
      <Climate />
      <Coexist />
      <Footer />
    </div>
  );
}
