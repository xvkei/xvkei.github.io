import { isAppEnabled, isAppId, type AppId } from './apps';

export type Route = { app: AppId; projectId?: string };

/** '#/resume' → { app: 'resume' }, '#/project/my-app' → { app: 'project', projectId: 'my-app' } */
export function parseHash(hash: string = window.location.hash): Route | null {
  const [app, rest] = hash.replace(/^#\/?/, '').split('/');
  if (!app || !isAppId(app) || !isAppEnabled(app)) return null;
  if (app === 'project') {
    if (!rest) return { app: 'projects' };
    let projectId = rest;
    try {
      projectId = decodeURIComponent(rest);
    } catch {
      /* keep the raw segment */
    }
    return { app, projectId };
  }
  return { app };
}

export function toHash(route: Route): string {
  return route.app === 'project' && route.projectId ? `#/project/${encodeURIComponent(route.projectId)}` : `#/${route.app}`;
}