import type { ColorName } from '../lib/theme.ts';

/** A row of colour swatches explaining what the lines or dots in a chart mean. */
export default function Key({ items }: { items: [ColorName, string][] }) {
  return (
    <div className="key">
      {items.map(([color, label]) => (
        <span key={label}>
          <i style={{ background: `var(--${color})` }} />
          {label}
        </span>
      ))}
    </div>
  );
}
