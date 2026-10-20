export function TagList({ items, label }: { items: string[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="tags" aria-label={label}>
      {items.map((t) => (
        <li key={t} className="tag">{t}</li>
      ))}
    </ul>
  );
}