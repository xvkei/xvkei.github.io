import type { AppDef } from '../../app/apps';

export function AppTile({ app, size = 'md' }: { app: AppDef; size?: 'sm' | 'md' }) {
  const Icon = app.icon;
  return (
    <span className={`icon-tile tone-${app.tone} tile-${size}`} aria-hidden="true">
      <Icon size={size === 'md' ? 24 : 14} strokeWidth={1.75} />
    </span>
  );
}