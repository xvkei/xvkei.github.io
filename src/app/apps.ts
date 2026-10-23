import type { LucideIcon } from 'lucide-react';
import { Archive, BookHeart, FileCode, FileText, FolderOpen, Gamepad2, Mail, Music2, NotebookPen, SlidersHorizontal, StickyNote, Terminal, Trophy, User } from 'lucide-react';
import { guestbook, music, notes } from '../data/config';

export type AppId = 'readme' | 'projects' | 'archive' | 'project' | 'about' | 'resume' | 'contact' | 'music' | 'notes' | 'guestbook' | 'arcade' | 'settings' | 'terminal' | 'achievements';
export type Tone = 'sage' | 'ochre' | 'rose' | 'charcoal' | 'paper';

export type AppDef = {
  id: AppId;
  label: string;
  fileName: string;
  blurb: string;
  icon: LucideIcon;
  tone: Tone;
  /** shown as desktop icon / launcher row / Start-menu entry */
  listed: boolean;
  size: { w: number; h: number };
  pos: { x: number; y: number };
};

export type AppCtx = {
  mode: 'desktop' | 'mobile';
  openApp: (id: AppId) => void;
  openProject: (projectId: string) => void;
  projectId: string | null;
};

/** Overlapping windows only when there is genuinely room for them. */
export const DESKTOP_QUERY = '(min-width: 900px) and (min-height: 540px)';

const DEFS: AppDef[] = [
  { id: 'readme', label: 'Read me first', fileName: 'README_first.txt', blurb: 'how this little desktop works', icon: StickyNote, tone: 'paper', listed: true, size: { w: 440, h: 440 }, pos: { x: 280, y: 96 } },
  { id: 'projects', label: 'Projects', fileName: 'projects/', blurb: 'featured work, hand-picked', icon: FolderOpen, tone: 'ochre', listed: true, size: { w: 680, h: 560 }, pos: { x: 250, y: 24 } },
  { id: 'archive', label: 'GitHub', fileName: 'github_archive/', blurb: 'every public repository, live from GitHub', icon: Archive, tone: 'charcoal', listed: true, size: { w: 760, h: 600 }, pos: { x: 290, y: 48 } },
  { id: 'about', label: 'About me', fileName: 'about_me.txt', blurb: 'who I am and what I like working on', icon: User, tone: 'sage', listed: true, size: { w: 560, h: 520 }, pos: { x: 330, y: 72 } },
  { id: 'resume', label: 'Resume', fileName: 'resume.html', blurb: 'experience, projects and skills', icon: FileText, tone: 'paper', listed: true, size: { w: 620, h: 580 }, pos: { x: 370, y: 40 } },
  { id: 'contact', label: 'Contact', fileName: 'contact.vcf', blurb: 'email and profiles', icon: Mail, tone: 'rose', listed: true, size: { w: 460, h: 420 }, pos: { x: 420, y: 110 } },
  { id: 'music', label: 'Now playing', fileName: 'now_playing.m3u', blurb: 'a little music player', icon: Music2, tone: 'rose', listed: true, size: { w: 480, h: 720 }, pos: { x: 600, y: 24 } },
  { id: 'notes', label: 'Notes', fileName: 'notes.md', blurb: 'short notes on learning and experiments', icon: NotebookPen, tone: 'ochre', listed: true, size: { w: 520, h: 500 }, pos: { x: 360, y: 90 } },
  { id: 'guestbook', label: 'Guestbook', fileName: 'guestbook.txt', blurb: 'sign it on your way out', icon: BookHeart, tone: 'rose', listed: true, size: { w: 560, h: 640 }, pos: { x: 440, y: 48 } },
  { id: 'arcade', label: 'Arcade', fileName: 'arcade.exe', blurb: 'a few tiny games for a break', icon: Gamepad2, tone: 'sage', listed: true, size: { w: 500, h: 620 }, pos: { x: 470, y: 40 } },
  { id: 'settings', label: 'Settings', fileName: 'settings.app', blurb: 'themes and desktop preferences', icon: SlidersHorizontal, tone: 'paper', listed: true, size: { w: 440, h: 440 }, pos: { x: 520, y: 80 } },
  { id: 'terminal', label: 'Terminal', fileName: 'terminal.app', blurb: 'optional shortcuts by command', icon: Terminal, tone: 'charcoal', listed: true, size: { w: 600, h: 400 }, pos: { x: 420, y: 200 } },
  { id: 'project', label: 'Project details', fileName: 'project.md', blurb: '', icon: FileCode, tone: 'paper', listed: false, size: { w: 640, h: 600 }, pos: { x: 400, y: 32 } },
  { id: 'achievements', label: 'Achievements', fileName: 'achievements.log', blurb: 'secrets found around the desktop', icon: Trophy, tone: 'ochre', listed: false, size: { w: 440, h: 560 }, pos: { x: 500, y: 60 } },
];

export const APP_BY_ID = Object.fromEntries(DEFS.map((d) => [d.id, d])) as Record<AppId, AppDef>;
export const ALL_APP_IDS: AppId[] = DEFS.map((d) => d.id);

export function isAppId(value: string): value is AppId {
  return DEFS.some((d) => d.id === value);
}

export function isAppEnabled(id: AppId): boolean {
  if (id === 'notes') return notes.enabled && notes.items.length > 0;
  if (id === 'music') return music.items.length > 0;
  if (id === 'guestbook') return Boolean(guestbook.url && guestbook.publishableKey);
  return true;
}

export const APPS: AppDef[] = DEFS.filter((d) => d.listed && isAppEnabled(d.id));