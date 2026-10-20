import { ALL_APP_IDS, APP_BY_ID, type AppId } from './apps';

export type Bounds = { width: number; height: number };
export type WinState = { open: boolean; minimized: boolean; maximized: boolean; x: number; y: number; z: number };
export type WmState = { wins: Record<AppId, WinState>; order: AppId[]; topZ: number };

export type WmAction =
  | { type: 'open'; id: AppId; bounds: Bounds }
  | { type: 'close' | 'minimize' | 'toggleMax' | 'focus'; id: AppId }
  | { type: 'move'; id: AppId; x: number; y: number }
  | { type: 'clamp'; bounds: Bounds };

export const WINDOW_MARGIN = 8;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/** Mirrors the CSS: width = min(default, 100% - 2 × margin). */
export function fittedSize(id: AppId, b: Bounds) {
  const { w, h } = APP_BY_ID[id].size;
  return { w: Math.min(w, b.width - WINDOW_MARGIN * 2), h: Math.min(h, b.height - WINDOW_MARGIN * 2) };
}

function clampPosition(id: AppId, x: number, y: number, b: Bounds) {
  const s = fittedSize(id, b);
  return { x: clamp(x, 0, b.width - s.w), y: clamp(y, 0, b.height - s.h) };
}

function patch(state: WmState, id: AppId, next: Partial<WinState>, extra: Partial<WmState> = {}): WmState {
  const wins = { ...state.wins };
  wins[id] = { ...wins[id], ...next };
  return { ...state, ...extra, wins };
}

export function createWmState(initiallyOpen: AppId[], bounds: Bounds): WmState {
  const wins = {} as Record<AppId, WinState>;
  for (const id of ALL_APP_IDS) {
    const { x, y } = APP_BY_ID[id].pos;
    wins[id] = { open: false, minimized: false, maximized: false, x, y, z: 0 };
  }
  let state: WmState = { wins, order: [], topZ: 0 };
  for (const id of initiallyOpen) state = wmReducer(state, { type: 'open', id, bounds });
  return state;
}

export function wmReducer(state: WmState, action: WmAction): WmState {
  switch (action.type) {
    case 'open': {
      const { id, bounds } = action;
      const w = state.wins[id];
      if (w.open && !w.minimized && w.z === state.topZ) return state;
      const z = state.topZ + 1;
      const pos = w.open ? { x: w.x, y: w.y } : clampPosition(id, w.x, w.y, bounds);
      const order = state.order.includes(id) ? state.order : [...state.order, id];
      return patch(state, id, { ...pos, open: true, minimized: false, z }, { topZ: z, order });
    }
    case 'close': {
      if (!state.wins[action.id].open) return state;
      return patch(state, action.id, { open: false, minimized: false, maximized: false }, { order: state.order.filter((i) => i !== action.id) });
    }
    case 'minimize': {
      const w = state.wins[action.id];
      if (!w.open || w.minimized) return state;
      return patch(state, action.id, { minimized: true });
    }
    case 'toggleMax': {
      const w = state.wins[action.id];
      if (!w.open) return state;
      const z = state.topZ + 1;
      return patch(state, action.id, { maximized: !w.maximized, minimized: false, z }, { topZ: z });
    }
    case 'focus': {
      const w = state.wins[action.id];
      if (!w.open || w.minimized || w.z === state.topZ) return state;
      const z = state.topZ + 1;
      return patch(state, action.id, { z }, { topZ: z });
    }
    case 'move': {
      const w = state.wins[action.id];
      if (w.x === action.x && w.y === action.y) return state;
      return patch(state, action.id, { x: action.x, y: action.y });
    }
    case 'clamp': {
      let changed = false;
      const wins = { ...state.wins };
      for (const id of ALL_APP_IDS) {
        const w = wins[id];
        if (!w.open) continue;
        const p = clampPosition(id, w.x, w.y, action.bounds);
        if (p.x !== w.x || p.y !== w.y) {
          wins[id] = { ...w, ...p };
          changed = true;
        }
      }
      return changed ? { ...state, wins } : state;
    }
    default:
      return state;
  }
}

export function getActiveId(state: WmState): AppId | null {
  let active: AppId | null = null;
  let best = -1;
  for (const id of state.order) {
    const w = state.wins[id];
    if (w.open && !w.minimized && w.z > best) {
      best = w.z;
      active = id;
    }
  }
  return active;
}