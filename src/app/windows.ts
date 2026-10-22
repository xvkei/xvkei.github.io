import { ALL_APP_IDS, APP_BY_ID, type AppId } from './apps';

export type Bounds = { width: number; height: number };
export type Size = { w: number; h: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type WinState = { open: boolean; minimized: boolean; maximized: boolean; x: number; y: number; w: number; h: number; z: number };
export type WmState = { wins: Record<AppId, WinState>; order: AppId[]; topZ: number };

export type WmAction =
  | { type: 'open'; id: AppId; bounds: Bounds }
  | { type: 'close' | 'minimize' | 'toggleMax' | 'focus'; id: AppId }
  | { type: 'move'; id: AppId; x: number; y: number }
  | { type: 'resize'; id: AppId; rect: Rect; bounds: Bounds }
  | { type: 'clamp'; bounds: Bounds };

export const WINDOW_MARGIN = 8;
export const MIN_SIZE: Size = { w: 300, h: 200 };

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/** Mirrors the CSS: width = min(size, 100% - 2 × margin). */
export function fittedSize(size: Size, b: Bounds): Size {
  return { w: Math.min(size.w, b.width - WINDOW_MARGIN * 2), h: Math.min(size.h, b.height - WINDOW_MARGIN * 2) };
}

function clampPosition(size: Size, x: number, y: number, b: Bounds) {
  const s = fittedSize(size, b);
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
    const { pos, size } = APP_BY_ID[id];
    wins[id] = { open: false, minimized: false, maximized: false, x: pos.x, y: pos.y, w: size.w, h: size.h, z: 0 };
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
      const pos = w.open ? { x: w.x, y: w.y } : clampPosition(w, w.x, w.y, bounds);
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
    case 'resize': {
      const { id, rect, bounds } = action;
      if (!state.wins[id].open) return state;
      const size = {
        w: Math.round(clamp(rect.w, MIN_SIZE.w, bounds.width - WINDOW_MARGIN * 2)),
        h: Math.round(clamp(rect.h, MIN_SIZE.h, bounds.height - WINDOW_MARGIN * 2)),
      };
      const pos = clampPosition(size, Math.round(rect.x), Math.round(rect.y), bounds);
      return patch(state, id, { ...size, ...pos });
    }
    case 'clamp': {
      let changed = false;
      const wins = { ...state.wins };
      for (const id of ALL_APP_IDS) {
        const w = wins[id];
        if (!w.open) continue;
        const p = clampPosition(w, w.x, w.y, action.bounds);
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