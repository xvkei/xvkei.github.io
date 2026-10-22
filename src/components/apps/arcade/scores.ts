const KEY = 'arcade.best.v1';

function readAll(): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function getBest(game: string): number | null {
  const v = readAll()[game];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Saves the score if it beats the old one (lower is better). Returns true on a new best. */
export function saveBest(game: string, value: number): boolean {
  const current = getBest(game);
  if (current !== null && value >= current) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [game]: value }));
  } catch {
    // storage full or blocked (private mode); the game still works
  }
  return true;
}