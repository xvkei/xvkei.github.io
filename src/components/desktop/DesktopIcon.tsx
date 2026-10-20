import type { AppDef, AppId } from '../../app/apps';
import { AppTile } from './AppTile';

export function DesktopIcon({ app, onOpen }: { app: AppDef; onOpen: (id: AppId) => void }) {
  return (
    <button
      type="button"
      className="desk-icon"
      data-app-icon={app.id}
      aria-label={`${app.label} (${app.fileName})`}
      onClick={() => onOpen(app.id)}
    >
      <AppTile app={app} />
      <span className="desk-icon-label">{app.fileName.replace(/_/g, '_\u200B')}</span>
    </button>
  );
}