import type { Repo } from './types';

const PREFIX = 'haya.exe:repos:';
const key = (username: string) => PREFIX + username.toLowerCase();

const looksLikeRepo = (r: unknown): r is Repo =>
  typeof r === 'object' && r !== null &&
  typeof (r as Repo).id === 'number' && typeof (r as Repo).name === 'string' &&
  typeof (r as Repo).url === 'string' && Array.isArray((r as Repo).topics);

export function readCache(username: string, maxAgeMinutes: number): Repo[] | null {
  if (!username || maxAgeMinutes <= 0) return null;
  try {
    const raw = sessionStorage.getItem(key(username));
    if (!raw) return null;
    const entry = JSON.parse(raw) as { savedAt?: unknown; repos?: unknown };
    if (typeof entry.savedAt !== 'number' || !Array.isArray(entry.repos)) return null;
    if (Date.now() - entry.savedAt > maxAgeMinutes * 60_000) return null;
    return entry.repos.filter(looksLikeRepo);
  } catch {
    return null;
  }
}

export function writeCache(username: string, repos: Repo[]): void {
  try {
    sessionStorage.setItem(key(username), JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    /* storage full or unavailable — caching is optional */
  }
}