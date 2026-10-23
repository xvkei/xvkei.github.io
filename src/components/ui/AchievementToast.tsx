import { useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { dismissToast, useAchievements } from '../../lib/achievements';

export function AchievementToast() {
  const { toast } = useAchievements();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(dismissToast, 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

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