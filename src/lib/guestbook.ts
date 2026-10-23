import { guestbook } from '../data/config';

export type GuestbookEntry = { id: number; created_at: string; name: string; message: string };

const TABLE_URL = `${guestbook.url.replace(/\/+$/, '')}/rest/v1/guestbook`;
const HEADERS = { apikey: guestbook.publishableKey };

/** How many entries to show, newest first. */
export const ENTRY_LIMIT = 100;

/** An error whose message is safe and friendly to show to visitors. */
export class GuestbookError extends Error {}

async function friendlyError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { code?: string; message?: string };
    if (body.code === 'P0001' && body.message) return `${body.message}.`; // raised by our SQL trigger
    if (body.code === '23514') return 'that name or message is too long, or empty.';
  } catch {
    /* body wasn't JSON */
  }
  return `the guestbook isn't answering right now (error ${res.status}). try again later?`;
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new GuestbookError("couldn't reach the guestbook. check your connection and try again.");
  }
  if (!res.ok) throw new GuestbookError(await friendlyError(res));
  return (await res.json()) as T;
}

export function fetchEntries(signal?: AbortSignal) {
  const params = new URLSearchParams({
    select: 'id,created_at,name,message',
    order: 'id.desc',
    limit: String(ENTRY_LIMIT),
  });
  return request<GuestbookEntry[]>(`${TABLE_URL}?${params}`, { headers: HEADERS, signal });
}

export async function signGuestbook(name: string, message: string) {
  const rows = await request<GuestbookEntry[]>(TABLE_URL, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ name, message }),
  });
  return rows[0];
}