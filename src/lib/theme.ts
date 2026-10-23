import { useSyncExternalStore } from 'react';
import { unlock } from './achievements';

export type Theme = 'linen' | 'night';
export type ThemePref = Theme | 'system';


export const THEME_OPTIONS: Array<{ id: ThemePref; label: string; blurb: string }> = [
  { id: 'system', label: 'match my device', blurb: 'follows your light or dark mode setting' },
  { id: 'linen', label: 'linen', blurb: 'warm paper, the original look' },
  { id: 'night', label: 'night', blurb: 'dark and cozy, easy on the eyes' },
];

const KEY = 'haya.theme'; // keep in sync with the inline script in index.html
const META_COLOR: Record<Theme, string> = { linen: '#e8e3d7', night: '#1b1d19' };
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'linen' || v === 'night' || v === 'system') return v;
  } catch {
    /* storage blocked */
  }
  return 'system';
}

function resolve(p: ThemePref): Theme {
  if (p !== 'system') return p;
  return darkQuery.matches ? 'night' : 'linen';
}

let pref: ThemePref = readPref();
let theme: Theme = resolve(pref);

function apply() {
  theme = resolve(pref);
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
  listeners.forEach((l) => l());
}

/** Call once at startup. Also follows the OS live while the preference is "system". */
export function initTheme() {
  apply();
  darkQuery.addEventListener('change', () => {
    if (pref === 'system') apply();
  });
}

export const getThemePref = () => pref;
export const getTheme = () => theme;

export function setThemePref(next: ThemePref) {
  pref = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* storage blocked: still applies for this visit */
  }
  apply();
  if (theme === 'night') unlock('night-owl');
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, getThemePref);
  const resolved = useSyncExternalStore(subscribe, getTheme);
  return { pref: current, theme: resolved, setPref: setThemePref };
}