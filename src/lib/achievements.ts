import { useSyncExternalStore } from 'react';
import { APPS, type AppId } from '../app/apps';
import { featuredProjects } from '../data/config';

export type AchievementId =
  | 'explorer'
  | 'curator'
  | 'night-owl'
  | 'interior-designer'
  | 'hacker-voice'
  | 'turn-it-off'
  | 'mind-reader'
  | 'konami'
  | 'stalemate'
  | 'sweeper'
  | 'elephant-memory'
  | 'signed';

export type Achievement = {
  id: AchievementId;
  name: string;
  /** shown once unlocked */
  description: string;
  /** shown under "???" while locked */
  hint: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'explorer', name: 'Explorer', description: 'opened every app on the desktop', hint: 'open everything at least once' },
  { id: 'curator', name: 'Curator', description: 'read the details of every featured project', hint: 'take a closer look at the projects' },
  { id: 'night-owl', name: 'Night owl', description: 'switched to the night theme', hint: 'it gets dark around here' },
  { id: 'interior-designer', name: 'Interior designer', description: 'resized a window', hint: 'windows are more flexible than they look' },
  { id: 'hacker-voice', name: 'Hacker voice', description: 'tried sudo in the terminal', hint: 'the terminal has a secret command' },
  { id: 'turn-it-off', name: 'Have you tried turning it off and on again', description: 'rebooted the desktop', hint: 'some problems have a classic fix' },
  { id: 'mind-reader', name: 'Mind reader', description: 'guessed the terminal number in 7 tries or fewer', hint: 'play the guessing game, and be quick about it' },
  { id: 'konami', name: 'Up up down down', description: 'entered the Konami code', hint: 'a classic cheat code works here' },
  { id: 'stalemate', name: 'Stalemate', description: 'drew against the unbeatable computer', hint: "you can't beat the unbeatable, but you can stop it winning" },
  { id: 'sweeper', name: 'Sweeper', description: 'cleared a Minesweeper board', hint: 'tread carefully in the arcade' },
  { id: 'elephant-memory', name: 'Elephant memory', description: 'finished memory match in 12 moves or fewer', hint: 'remember where everything is, and be quick' },
  { id: 'signed', name: 'Signed!', description: 'signed the guestbook', hint: 'leave a note on your way out' },
];

/** Featured projects whose details count toward Curator. */
export const FEATURED_IDS = featuredProjects.filter((p) => p.featured).map((p) => p.id);

const BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a])) as Record<AchievementId, Achievement>;
const KEY = 'haya.achievements.v1';
const EXPLORED_KEY = 'haya.explored.v1'; // opened apps, plus "project:<id>" for viewed projects
const projectKey = (id: string) => `project:${id}`;

type Unlocked = Partial<Record<AchievementId, number>>;

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: progress lasts for this visit */
  }
}

function readUnlocked(): Unlocked {
  const raw = read(KEY);
  const out: Unlocked = {};
  if (raw && typeof raw === 'object') {
    for (const a of ACHIEVEMENTS) {
      const t = (raw as Record<string, unknown>)[a.id];
      if (typeof t === 'number') out[a.id] = t;
    }
  }
  return out;
}

function readExplored(): Set<string> {
  const raw = read(EXPLORED_KEY);
  return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
}

let unlocked = readUnlocked();
let explored = readExplored();
let queue: Achievement[] = []; // pop-ups waiting to be shown

type Snapshot = {
  unlocked: Unlocked;
  explored: ReadonlySet<string>;
  toast: Achievement | null;
  found: number;
  total: number;
};

const build = (): Snapshot => ({
  unlocked,
  explored,
  toast: queue[0] ?? null,
  found: ACHIEVEMENTS.filter((a) => unlocked[a.id]).length,
  total: ACHIEVEMENTS.length,
});

let snapshot = build();
const listeners = new Set<() => void>();

function emit() {
  snapshot = build();
  listeners.forEach((l) => l());
}

function remember(key: string) {
  if (explored.has(key)) return;
  explored = new Set(explored).add(key);
  write(EXPLORED_KEY, [...explored]);
  emit();
}

/** Unlocks an achievement. Returns true if it was newly unlocked. */
export function unlock(id: AchievementId): boolean {
  if (unlocked[id]) return false;
  unlocked = { ...unlocked, [id]: Date.now() };
  write(KEY, unlocked);
  queue = [...queue, BY_ID[id]];
  emit();
  return true;
}

/** Remembers that an app was opened, and unlocks Explorer once every listed app has been. */
export function noteAppOpened(id: AppId) {
  remember(id);
  if (!unlocked.explorer && APPS.every((a) => explored.has(a.id))) unlock('explorer');
}

/** Remembers that a project's details were viewed, and unlocks Curator once every featured one has been. */
export function noteProjectViewed(id: string) {
  remember(projectKey(id));
  if (!unlocked.curator && FEATURED_IDS.length > 0 && FEATURED_IDS.every((pid) => explored.has(projectKey(pid)))) {
    unlock('curator');
  }
}

/** How many featured projects have had their details viewed. */
export const projectsViewed = (seen: ReadonlySet<string>) => FEATURED_IDS.filter((pid) => seen.has(projectKey(pid))).length;

export function dismissToast() {
  if (queue.length === 0) return;
  queue = queue.slice(1);
  emit();
}

export function resetAchievements() {
  unlocked = {};
  explored = new Set();
  queue = [];
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(EXPLORED_KEY);
  } catch {
    /* storage blocked */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => snapshot;

export function useAchievements() {
  return useSyncExternalStore(subscribe, getSnapshot);
}