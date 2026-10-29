import type { ReactNode } from 'react';

type PlateProps = { id: string; no: number; scale: string; title: string; children: ReactNode };

/** One chapter of the atlas: a numbered plate with its scale marker and headline. */
export default function Plate({ id, no, scale, title, children }: PlateProps) {
  return (
    <section className="plate" id={id}>
      <div className="plate-head">
        <div className="plate-no">{no}</div>
        <div className="scale">{scale}</div>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
