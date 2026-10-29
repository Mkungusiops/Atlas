import { Fragment } from 'react';
import Facts from '../components/Facts.tsx';
import Key from '../components/Key.tsx';
import Plate from '../components/Plate.tsx';
import { alpha, useTokens } from '../lib/theme.ts';

type LonLat = [lon: number, lat: number];
// kind: c = big compute hub, s = chip supply chain, g = fast-growing hub
type Hub = [name: string, lon: number, lat: number, kind: 'c' | 's' | 'g', label: [dx: number, dy: number, anchor: 'start' | 'end']];

const HUBS: Hub[] = [
  ['N. Virginia', -77.5, 39, 'c', [8, 14, 'start']],
  ['Oregon', -121, 45.6, 'c', [-8, -8, 'end']],
  ['Texas', -97, 31, 'c', [-8, 12, 'end']],
  ['Ireland', -6.3, 53.3, 'c', [-8, -6, 'end']],
  ['Amsterdam', 4.9, 52.4, 'c', [8, -10, 'start']],
  ['Frankfurt', 8.7, 50.1, 'c', [10, 6, 'start']],
  ['Nordics', 18, 62, 'c', [8, -6, 'start']],
  ['Singapore', 103.8, 1.35, 'c', [8, 14, 'start']],
  ['Tokyo', 139.7, 35.7, 'c', [8, 4, 'start']],
  ['Beijing', 116.4, 39.9, 'c', [-8, -8, 'end']],
  ['Taiwan (chips)', 121, 24.5, 's', [9, 10, 'start']],
  ['S. Korea (memory)', 127, 37, 's', [8, -10, 'start']],
  ['Netherlands (lithography)', 5.4, 51.4, 's', [-10, 22, 'end']],
  ['UAE & Saudi', 50, 24.5, 'g', [-6, 16, 'end']],
  ['Mumbai', 72.9, 19.1, 'g', [6, 16, 'start']],
  ['Lagos', 3.4, 6.5, 'g', [-8, 4, 'end']],
  ['Nairobi', 36.8, -1.3, 'g', [9, 4, 'start']],
  ['Johannesburg', 28, -26.2, 'g', [8, 4, 'start']],
  ['São Paulo', -46.6, -23.5, 'g', [8, 4, 'start']],
  ['Sydney', 151.2, -33.9, 'g', [-8, 16, 'end']],
];
const CABLES: [LonLat, LonLat][] = [
  [[-77.5, 39], [-6.3, 53.3]], [[-77.5, 39], [-9, 38.7]], [[3.4, 6.5], [-9, 38.7]], [[28, -26.2], [3.4, 6.5]],
  [[36.8, -1.3], [72.9, 19.1]], [[72.9, 19.1], [103.8, 1.35]], [[103.8, 1.35], [5.4, 43.3]], [[-118, 34], [139.7, 35.7]],
  [[151.2, -33.9], [-118, 34]], [[-46.6, -23.5], [-77.5, 39]], [[-46.6, -23.5], [3.4, 6.5]], [[121, 24.5], [-121, 45.6]],
];
const REGIONS: [string, number, number][] = [
  ['NORTH AMERICA', -105, 52], ['SOUTH AMERICA', -62, -12], ['EUROPE', 15, 58], ['AFRICA', 20, 12],
  ['ASIA', 95, 55], ['OCEANIA', 134, -24], ['MIDDLE EAST', 45, 33],
];
const LONGITUDES = [-180, -150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180];
const LATITUDES = [-60, -30, 0, 30, 60, 90];

function Globe() {
  const C = useTokens();
  const W = 900, H = 470;
  const P = ([lon, lat]: LonLat) => [(lon + 180) / 360 * W, (90 - lat) / 180 * H * 1.0];
  const color = { c: C.teal, s: C.amber, g: C.violet };
  return (
    <svg viewBox="0 0 900 470" role="img" aria-label="Schematic world grid showing compute hubs, chip supply points, growing hubs and undersea cable links">
      <rect x={0} y={0} width={W} height={H} fill={C.panel} />
      {LONGITUDES.map((lon) => {
        const x = P([lon, 0])[0];
        return <line key={`lon${lon}`} x1={x} x2={x} y1={0} y2={H} stroke={C.line} strokeWidth={lon === 0 ? 1.4 : 0.8} />;
      })}
      {LATITUDES.map((lat) => {
        const y = P([0, lat])[1];
        return <line key={`lat${lat}`} x1={0} x2={W} y1={y} y2={y} stroke={C.line} strokeWidth={lat === 0 ? 1.4 : 0.8} />;
      })}
      {REGIONS.map(([name, lon, lat]) => {
        const [x, y] = P([lon, lat]);
        return <text key={name} x={x} y={y} textAnchor="middle" fill={alpha(C.muted, 0.55)} fontSize={13} letterSpacing={3}>{name}</text>;
      })}
      {CABLES.map(([a, b], i) => {
        const p = P(a), q = P(b), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2 + Math.abs(q[0] - p[0]) * 0.12;
        return <path key={i} d={`M${p[0]} ${p[1]} Q${mx} ${my} ${q[0]} ${q[1]}`} fill="none" stroke={C.muted} strokeWidth={1.2} strokeDasharray="3 4" opacity={0.8} />;
      })}
      {HUBS.map(([name, lon, lat, kind]) => {
        const [x, y] = P([lon, lat]), r = kind === 'c' ? 7 : 6;
        return (
          <Fragment key={name}>
            <circle cx={x} cy={y} r={r + 5} fill={alpha(color[kind], 0.18)} />
            <circle cx={x} cy={y} r={r} fill={color[kind]} stroke={C.panel} strokeWidth={1.5} />
          </Fragment>
        );
      })}
      {HUBS.map(([name, lon, lat, , [dx, dy, anchor]]) => {
        const [x, y] = P([lon, lat]);
        return <text key={name} x={x + dx} y={y + dy} textAnchor={anchor} fill={C.ink} fontSize={11}>{name}</text>;
      })}
    </svg>
  );
}

export default function Earth() {
  return (
    <Plate id="earth" no={6} scale="The planet · a schematic, not a precise map" title="Where on Earth this physically happens">
      <div className="panel svgbox"><Globe /></div>
      <Key items={[['teal', 'Big compute hubs'], ['amber', 'Chip supply chain'], ['violet', 'Fast-growing hubs'], ['muted', 'Undersea cables (illustrative)']]} />
      <Facts
        items={[
          ['Concentrated', 'Most of the computing that runs large models sits in a small number of regions, led by the United States. The most advanced chips come from a very short supply chain centered on Taiwan, with key machines made in the Netherlands and memory from South Korea.'],
          ['Spreading', 'The Gulf states, India, and African hubs such as Lagos, Johannesburg and Nairobi are building data centers. New undersea cables landing in Africa are a big part of that.'],
          ['Hungry', 'A large AI data center can use as much electricity as a small city. Power, water for cooling, and land are now as important as clever software.'],
        ]}
      />
    </Plate>
  );
}
