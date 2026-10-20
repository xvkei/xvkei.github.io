/** Returns a normalised http(s) URL, or null for anything else (javascript:, data:, junk). */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  if (!s) return null;
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(s) ? s : `https://${s}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}