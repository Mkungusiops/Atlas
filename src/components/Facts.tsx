/** A row of small tagged cards. */
export default function Facts({ items }: { items: [tag: string, text: string][] }) {
  return (
    <div className="facts">
      {items.map(([tag, text]) => (
        <div className="fact panel" key={tag}>
          <span className="tag">{tag}</span>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
