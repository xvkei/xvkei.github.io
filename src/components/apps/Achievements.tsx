import { Check, Lock } from 'lucide-react';
import { APPS } from '../../app/apps';
import { ACHIEVEMENTS, resetAchievements, useAchievements } from '../../lib/achievements';

const dateFmt = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export function Achievements() {
  const { unlocked, explored, found, total } = useAchievements();
  const opened = APPS.filter((a) => explored.has(a.id)).length;

  return (
    <div className="app achievements">
      <p className="app-intro">little secrets hidden around the desktop. explore, poke around, try things.</p>

      <div className="achv-progress">
        <p className="achv-count">
          <strong>{found}/{total}</strong> secrets found
        </p>
        <div className="achv-bar" aria-hidden="true">
          <span style={{ width: `${(found / total) * 100}%` }} />
        </div>
      </div>

      <ul className="achv-list">
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked[a.id];
          return (
            <li key={a.id} className={`achv-item${at ? ' is-unlocked' : ''}`}>
              <span className="achv-icon" aria-hidden="true">
                {at ? <Check size={16} /> : <Lock size={15} />}
              </span>
              <div>
                <p className="achv-name">
                  {at ? (
                    a.name
                  ) : (
                    <>
                      <span aria-hidden="true">???</span>
                      <span className="sr-only">locked achievement</span>
                    </>
                  )}
                </p>
                <p className="achv-desc">
                  {at ? a.description : a.hint}
                  {!at && a.id === 'explorer' && ` (${opened}/${APPS.length} opened)`}
                </p>
                {at && <p className="achv-date">found {dateFmt.format(at)}</p>}
              </div>
            </li>
          );
        })}
      </ul>

      {found > 0 && (
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (window.confirm('reset all achievements and start over?')) resetAchievements();
          }}
        >
          start over
        </button>
      )}
    </div>
  );
}