import { notes } from '../../data/config';
import { formatDate } from '../../lib/format';

/** Hidden from the desktop until notes.enabled is true and items exist. */
export function Notes() {
  return (
    <div className="app notes">
      <ol className="notes-list" role="list">
        {notes.items.map((n) => (
          <li key={n.id}>
            <article className="note-card" aria-labelledby={`note-${n.id}`}>
              <h3 id={`note-${n.id}`}>{n.title}</h3>
              {n.date && (
                <p className="mono small muted">
                  <time dateTime={n.date}>{formatDate(n.date) ?? n.date}</time>
                </p>
              )}
              <p className="note-body">{n.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}