const dateFmt = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : dateFmt.format(d);
}

/** Decorative catalogue number derived from list position (not a real-world fact). */
export const catalogNo = (index: number) => `HY-${String(index + 1).padStart(3, '0')}`;

/** Resolves a /public asset path against Vite's base URL; absolute URLs pass through. */
export function resolveAsset(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}