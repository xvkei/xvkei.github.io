import type { Repo } from './types';

export type RepoSort = 'updated' | 'name';
export type RepoFilters = { query: string; language: string; topic: string; sort: RepoSort };

const byName = (a: Repo, b: Repo) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
const time = (r: Repo) => (r.updatedAt ? Date.parse(r.updatedAt) : 0);
const byUpdated = (a: Repo, b: Repo) => time(b) - time(a) || byName(a, b);

export function filterRepos(repos: Repo[], f: RepoFilters): Repo[] {
  const q = f.query.trim().toLowerCase();
  return repos
    .filter((r) => {
      if (f.language && r.language !== f.language) return false;
      if (f.topic && !r.topics.includes(f.topic)) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        r.topics.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort(f.sort === 'name' ? byName : byUpdated);
}

export function collectLanguages(repos: Repo[]): string[] {
  return [...new Set(repos.map((r) => r.language).filter((l): l is string => Boolean(l)))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function collectTopics(repos: Repo[], limit = 30): string[] {
  const counts = new Map<string, number>();
  repos.forEach((r) => r.topics.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([t]) => t)
    .sort((a, b) => a.localeCompare(b));
}