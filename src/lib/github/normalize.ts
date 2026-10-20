import { safeHttpUrl } from '../url';
import type { Repo } from './types';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

/** Maps one raw API object to a Repo, or null if it is malformed or private. */
export function normalizeRepo(raw: unknown): Repo | null {
  if (!isRecord(raw)) return null;
  if (raw.private === true) return null; // never surface private repositories

  const id = raw.id;
  const name = text(raw.name);
  const url = safeHttpUrl(raw.html_url);
  if (typeof id !== 'number' || !name || !url) return null;

  const topics = Array.isArray(raw.topics)
    ? raw.topics.filter((t): t is string => typeof t === 'string' && t.trim() !== '')
    : [];
  const updated = text(raw.updated_at);

  return {
    id,
    name,
    description: text(raw.description),
    url,
    homepage: safeHttpUrl(raw.homepage),
    language: text(raw.language),
    topics,
    updatedAt: updated && !Number.isNaN(Date.parse(updated)) ? updated : null,
    isFork: raw.fork === true,
    isArchived: raw.archived === true,
  };
}