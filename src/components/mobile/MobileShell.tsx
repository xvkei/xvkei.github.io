import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Archive, ArrowLeft, FolderOpen, House, Mail, User } from 'lucide-react';
import { APP_BY_ID, type AppCtx, type AppId } from '../../app/apps';
import { parseHash, toHash, type Route } from '../../app/routes';
import { featuredProjects, site } from '../../data/config';
import { AppContent } from '../apps/AppContent';
import { MobileHome } from './MobileHome';
import { noteAppOpened } from '../../lib/achievements';
import { AchievementToast } from '../ui/AchievementToast';

type DockItem = { id: AppId | 'home'; label: string; icon: LucideIcon };
const DOCK: DockItem[] = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'archive', label: 'Repos', icon: Archive },
  { id: 'about', label: 'About', icon: User },
  { id: 'contact', label: 'Contact', icon: Mail },
];

export function MobileShell() {
  const [route, setRoute] = useState<Route | null>(() => parseHash());
  const routeRef = useRef<Route | null>(route);
  const prevRoute = useRef<Route | null>(route);
  const homeScroll = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // the phone's back gesture closes the open app
  useEffect(() => {
    const onPop = () => {
      const next = parseHash();
      routeRef.current = next;
      setRoute(next);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

    // count every app that gets opened (Explorer achievement)
  useEffect(() => {
    if (route) noteAppOpened(route.app);
  }, [route]);

  const navigate = useCallback((next: Route) => {
    const hash = toHash(next);
    if (routeRef.current) {
      window.history.replaceState(window.history.state, '', hash);
    } else {
      homeScroll.current = window.scrollY;
      window.history.pushState({ haya: true }, '', hash);
    }
    routeRef.current = next;
    setRoute(next);
  }, []);

  const goHome = useCallback(() => {
    if (!routeRef.current) return;
    if ((window.history.state as { haya?: boolean } | null)?.haya) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    routeRef.current = null;
    setRoute(null);
  }, []);

  // scroll + focus management on navigation
  useEffect(() => {
    const prev = prevRoute.current;
    if (prev === route) return;
    prevRoute.current = route;
    if (route) {
      window.scrollTo(0, 0);
      headingRef.current?.focus({ preventScroll: true });
      return;
    }
    window.scrollTo(0, homeScroll.current);
    if (prev) document.querySelector<HTMLElement>(`[data-app-icon="${prev.app}"]`)?.focus({ preventScroll: true });
  }, [route]);

  useEffect(() => {
    if (!route) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if ((e.target as HTMLElement | null)?.closest('input, textarea, select')) return;
      goHome();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [route, goHome]);

  const projectId = route?.projectId ?? null;
  const ctx: AppCtx = useMemo(
    () => ({
      mode: 'mobile',
      openApp: (id: AppId) => navigate({ app: id }),
      openProject: (pid: string) => navigate({ app: 'project', projectId: pid }),
      projectId,
    }),
    [navigate, projectId],
  );

  const current = route ? (route.app === 'project' ? 'projects' : route.app) : 'home';

  return (
    <div className="m-shell">
      {route ? (
        <MobilePanel
          route={route}
          ctx={ctx}
          headingRef={headingRef}
          backLabel={route.app === 'project' ? 'projects' : 'home'}
          onBack={route.app === 'project' ? () => navigate({ app: 'projects' }) : goHome}
        />
      ) : (
        <MobileHome ctx={ctx} />
      )}

      <nav className="m-dock" aria-label="Main">
        {DOCK.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={current === id ? 'page' : undefined}
            onClick={() => (id === 'home' ? goHome() : navigate({ app: id }))}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <AchievementToast />
    </div>
  );
}

type PanelProps = {
  route: Route;
  ctx: AppCtx;
  headingRef: RefObject<HTMLHeadingElement>;
  backLabel: string;
  onBack: () => void;
};

function MobilePanel({ route, ctx, headingRef, backLabel, onBack }: PanelProps) {
  const app = APP_BY_ID[route.app];
  const project = route.app === 'project' ? featuredProjects.find((p) => p.id === route.projectId) : undefined;
  const title = route.app === 'project' ? project?.name ?? 'Project details' : app.label;
  const fileName = project ? `${project.id}.md` : app.fileName;

  return (
    <div className="m-panel">
      <h1 className="sr-only">{site.handle}.exe</h1>
      <header className="m-panel-bar">
        <button type="button" className="m-back" onClick={onBack} aria-label={`Back to ${backLabel}`}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>{backLabel}</span>
        </button>
        <h2 ref={headingRef} tabIndex={-1} className="m-panel-title">{title}</h2>
        <span className="m-panel-file" aria-hidden="true">{fileName}</span>
      </header>
      <main className="m-panel-body">
        <AppContent id={route.app} ctx={ctx} />
      </main>
    </div>
  );
}