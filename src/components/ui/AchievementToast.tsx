import { useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { dismissToast, unlock, useAchievements } from '../../lib/achievements';

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'].join(' ');

export function AchievementToast() {
  const { toast } = useAchievements();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ↑ ↑ ↓ ↓ ← → ← → B A, anywhere on the page
  useEffect(() => {
    const recent: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      recent.push(e.key.toLowerCase());
      if (recent.length > 10) recent.shift();
      if (recent.join(' ') === KONAMI) {
        recent.length = 0;
        unlock('konami');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="achv-toast-region" role="status" aria-live="polite">
      {toast && (
        <div key={toast.id} className="achv-toast">
          <Trophy className="achv-toast-icon" size={20} aria-hidden="true" />
          <div>
            <p className="achv-toast-kicker">achievement unlocked</p>
            <p className="achv-toast-name">{toast.name}</p>
            <p className="achv-toast-desc">{toast.description}</p>
          </div>
          <button type="button" className="achv-toast-close" onClick={dismissToast} aria-label="Dismiss achievement notice">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}