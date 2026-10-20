import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { LayoutGrid } from 'lucide-react';
import { APPS, APP_BY_ID, type AppId } from '../../app/apps';
import type { WmState } from '../../app/windows';
import { github, site } from '../../data/config';
import { githubProfileUrl } from '../../data/links';
import { ExtLink } from '../ui/ExtLink';
import { AppTile } from './AppTile';
import { Clock } from './Clock';

type Props = {
  wm: WmState;
  activeId: AppId | null;
  projectTitle: string;
  onTaskClick: (id: AppId) => void;
  onOpen: (id: AppId) => void;
};

export function Taskbar({ wm, activeId, projectTitle, onTaskClick, onOpen }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const profile = githubProfileUrl();

  useEffect(() => {
    if (!menuOpen) return;
    const wrap = wrapRef.current;
    wrap?.querySelector<HTMLElement>('.start-item')?.focus();
    const outside = (t: EventTarget | null) => !(t instanceof Node && wrap?.contains(t));
    const onPointerDown = (e: PointerEvent) => { if (outside(e.target)) setMenuOpen(false); };
    const onFocusIn = (e: FocusEvent) => { if (outside(e.target)) setMenuOpen(false); };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        startRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const onMenuKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.start-item'));
    if (items.length === 0) return;
    e.preventDefault();
    const i = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next].focus();
  };

  const choose = (id: AppId) => {
    setMenuOpen(false);
    onOpen(id);
  };

  return (
    <nav className="taskbar" aria-label="Taskbar">
      <div className="start-wrap" ref={wrapRef}>
        <button
          ref={startRef}
          type="button"
          className="start-btn"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'start-menu' : undefined}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <LayoutGrid size={16} aria-hidden="true" />
          <span>start</span>
        </button>

        {menuOpen && (
          <div id="start-menu" className="start-menu" onKeyDown={onMenuKeyDown}>
            <div className="start-side" aria-hidden="true"><span>{site.handle}.exe</span></div>
            <div className="start-main">
              <p className="start-head">
                <strong>{site.fullName ?? site.handle}</strong>
                <span className="mono">{site.role ?? 'portfolio desktop'}</span>
              </p>
              <ul className="start-list">
                {APPS.map((app) => (
                  <li key={app.id}>
                    <button type="button" className="start-item" onClick={() => choose(app.id)}>
                      <AppTile app={app} size="sm" />
                      <span>{app.label}</span>
                      <span className="start-item-file mono">{app.fileName}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {profile && (
                <div className="start-foot">
                  <ExtLink href={profile} className="start-item">github.com/{github.username}</ExtLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ul className="task-list" aria-label="Open windows">
        {wm.order.map((id) => {
          const w = wm.wins[id];
          const app = APP_BY_ID[id];
          const title = id === 'project' ? projectTitle : app.label;
          const status = w.minimized ? 'minimized' : id === activeId ? 'active' : 'open';
          return (
            <li key={id}>
              <button
                type="button"
                id={`task-${id}`}
                className={`task-btn is-${status}`}
                title={title}
                aria-label={`${title} (${status})`}
                onClick={() => onTaskClick(id)}
              >
                <AppTile app={app} size="sm" />
                <span className="task-label">{title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="task-status">
        <span className="sr-only">Local time </span>
        <Clock />
      </div>
    </nav>
  );
}