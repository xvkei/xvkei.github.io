import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { APPS, APP_BY_ID, ALL_APP_IDS, type AppCtx, type AppId } from '../../app/apps';
import { parseHash, type Route } from '../../app/routes';
import { createWmState, getActiveId, wmReducer, type Bounds, type Rect } from '../../app/windows';
import { featuredProjects, site } from '../../data/config';
import { AppContent } from '../apps/AppContent';
import { Window } from '../window/Window';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar } from './Taskbar';
import { noteAppOpened } from '../../lib/achievements';
import { AchievementToast } from '../ui/AchievementToast';


const TASKBAR_H = 46; // keep in sync with --taskbar-h

const estimateBounds = (): Bounds => ({ width: window.innerWidth, height: window.innerHeight - TASKBAR_H });
const focusWindow = (id: AppId) =>
  requestAnimationFrame(() => document.getElementById(`win-${id}`)?.focus({ preventScroll: true }));

export function DesktopShell() {
  const areaRef = useRef<HTMLDivElement>(null);
  const [initialRoute] = useState(() => parseHash());
  const [projectId, setProjectId] = useState<string | null>(initialRoute?.projectId ?? null);
  const [wm, dispatch] = useReducer(wmReducer, initialRoute, (route: Route | null) => {
    const ids: AppId[] = ['projects'];
    if (route && route.app !== 'projects') ids.push(route.app);
    return createWmState(ids, estimateBounds());
  });

  const getBounds = useCallback((): Bounds => {
    const el = areaRef.current;
    return el ? { width: el.clientWidth, height: el.clientHeight } : estimateBounds();
  }, []);

  const openApp = useCallback(
    (id: AppId) => {
      dispatch({ type: 'open', id, bounds: getBounds() });
      focusWindow(id);
    },
    [getBounds],
  );
  const openProject = useCallback(
    (pid: string) => {
      setProjectId(pid);
      openApp('project');
    },
    [openApp],
  );
  const focusApp = useCallback((id: AppId) => dispatch({ type: 'focus', id }), []);
  const closeApp = useCallback((id: AppId) => {
    dispatch({ type: 'close', id });
    const target =
      document.querySelector<HTMLElement>(`[data-app-icon="${id}"]`) ??
      document.querySelector<HTMLElement>('[data-app-icon="projects"]');
    target?.focus({ preventScroll: true });
  }, []);
  const minimizeApp = useCallback((id: AppId) => {
    dispatch({ type: 'minimize', id });
    document.getElementById(`task-${id}`)?.focus();
  }, []);
  const toggleMax = useCallback((id: AppId) => dispatch({ type: 'toggleMax', id }), []);
  const moveApp = useCallback((id: AppId, x: number, y: number) => dispatch({ type: 'move', id, x, y }), []);
  const resizeApp = useCallback(
    (id: AppId, rect: Rect) => dispatch({ type: 'resize', id, rect, bounds: getBounds() }),
    [getBounds],
  );

  const activeId = getActiveId(wm);
  const onTaskClick = useCallback(
    (id: AppId) => {
      if (!wm.wins[id].minimized && id === activeId) minimizeApp(id);
      else openApp(id);
    },
    [wm, activeId, minimizeApp, openApp],
  );

  // keep windows inside the desktop when the viewport changes
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => dispatch({ type: 'clamp', bounds: getBounds() }));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, [getBounds]);

    // count every app that gets opened, however it was opened (Explorer achievement)
  const openKey = ALL_APP_IDS.filter((id) => wm.wins[id].open).join(' ');
  useEffect(() => {
    openKey
      .split(' ')
      .filter(Boolean)
      .forEach((id) => noteAppOpened(id as AppId));
  }, [openKey]);

  const ctx: AppCtx = useMemo(() => ({ mode: 'desktop', openApp, openProject, projectId }), [openApp, openProject, projectId]);

  const project = featuredProjects.find((p) => p.id === projectId) ?? null;
  const projectTitle = project?.name ?? 'Project details';

  return (
    <div className="desktop">
      <button type="button" className="skip-link" onClick={() => openApp('projects')}>
        Skip to featured projects
      </button>

      <div className="desktop-area" ref={areaRef}>
        <h1 className="desk-label">{site.handle}'s desktop</h1>

        <nav className="desk-icons" aria-label="Desktop icons">
          <ul>
            {APPS.map((app) => (
              <li key={app.id}>
                <DesktopIcon app={app} onOpen={openApp} />
              </li>
            ))}
          </ul>
        </nav>

        <aside className="welcome-note" aria-labelledby="welcome-title">
          <p id="welcome-title" className="note-file">note_to_visitors.txt</p>
          <p className="note-text">{site.welcome}</p>
          <p className="note-links">
            start with{' '}
            <button type="button" className="link-btn" onClick={() => openApp('projects')}>featured projects</button>, browse{' '}
            <button type="button" className="link-btn" onClick={() => openApp('archive')}>every public repo</button>, or open the{' '}
            <button type="button" className="link-btn" onClick={() => openApp('resume')}>resume</button>.
          </p>
        </aside>

        <p className="desk-stamp mono" aria-hidden="true">{site.handle}.exe · personal archive · vol. 01</p>

        {ALL_APP_IDS.filter((id) => wm.wins[id].open).map((id) => {
          const app = APP_BY_ID[id];
          return (
            <Window
              key={id}
              id={id}
              title={id === 'project' ? projectTitle : app.label}
              fileName={id === 'project' && project ? `${project.id}.md` : app.fileName}
              icon={app.icon}
              win={wm.wins[id]}
              active={id === activeId}
              onFocus={focusApp}
              onClose={closeApp}
              onMinimize={minimizeApp}
              onToggleMax={toggleMax}
              onMove={moveApp}
              onResize={resizeApp}
            >
              <AppContent id={id} ctx={ctx} />
            </Window>
          );
        })}
      </div>

      <Taskbar wm={wm} activeId={activeId} projectTitle={projectTitle} onTaskClick={onTaskClick} onOpen={openApp} />
      <AchievementToast />
    </div>
  );
}