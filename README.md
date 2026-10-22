# haya.exe

A cozy personal-computer portfolio. On wide screens it's a desktop with draggable
windows; on phones and tablets it becomes a single-column launcher with
full-screen panels and a bottom dock. There's also a small arcade for a
coffee break.

Built with React, TypeScript, Vite, plain CSS and lucide-react icons.

## Setup

Requires Node.js 18 or newer (the LTS version from nodejs.org is fine).

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | local dev server with hot reload      |
| `npm run typecheck` | TypeScript check                      |
| `npm run lint`      | ESLint                                |
| `npm run build`     | typecheck + production build → `dist/`|
| `npm run preview`   | serve the production build locally    |

## Configuration

Everything personal lives in **`src/data/config.ts`**. Search it for `TODO`.
Anything left empty is hidden, or shown as a labelled "setup placeholder".

- **GitHub username:** set `GITHUB_USERNAME`, or create a `.env` file with
  `VITE_GITHUB_USERNAME=your-username`. Only your public username is needed.
  Never add a token or password; this is a static site and anything in it is
  public.
- **Archive options:** `github.includeForks`, `includeArchived`, `maxPages`,
  `cacheMinutes` (results are cached in sessionStorage to stay under GitHub's
  unauthenticated rate limit).
- **Featured projects:** edit `featuredProjects`. Delete `placeholder: true`
  once an entry is real. Screenshots go in `public/images/` and are referenced
  as `images/file.png` with their real width and height.
- **Resume:** put the PDF at `public/resume.pdf` and set
  `resume.pdfPath: 'resume.pdf'`. `summary`, `experience` and `education`
  fill the readable HTML version.
- **Contact:** `contact.email`, `contact.linkedin`, `contact.other`. Unset
  links are hidden. GitHub appears automatically once the username is set.
- **Notes / Now playing:** optional; hidden until they have content (`notes`
  also needs `enabled: true`). Now playing is a listening card, never audio.

## Arcade

`arcade.exe` is a window with three small games, all written from scratch with
no extra dependencies:

- **Tic-tac-toe** against the computer, with a "chill" mode and an
  "unbeatable" minimax mode. The first move alternates each round.
- **Minesweeper** on an 8×8 or 10×10 board. The first click is always safe.
  Flag with right-click, the F key, or the flag-mode toggle on touch screens.
- **Memory match** with 8 dev-themed pairs.

Best times and move counts are saved in localStorage under `arcade.best.v1`,
so they stay on the visitor's device and nothing is sent anywhere.

The terminal has a few extras too: `games` opens the arcade, plus `coinflip`,
`roll [sides]` and `guess [n]` (a 1–100 number guessing game).

## Deploying

`npm run build` produces a static site in `dist/`.

- **Netlify / Vercel / Cloudflare Pages:** build command `npm run build`,
  output directory `dist`. If you use the env var instead of editing
  config.ts, add `VITE_GITHUB_USERNAME` in the host's settings.
- **GitHub Pages:** `vite.config.ts` uses `base: './'`, so the build works
  from a repository sub-path. Publish the contents of `dist/` (for example
  with the official "Deploy static content to Pages" GitHub Action).

## Structure

```
src/
  app/          app registry, window manager reducer, hash routes
  components/
    desktop/    desktop shell, icons, taskbar, start menu
    window/     draggable window frame
    mobile/     launcher, full-screen panels, dock
    projects/   featured projects, detail view, GitHub archive
    apps/       about, resume, contact, notes, now playing, readme, terminal
      arcade/   arcade window, tic-tac-toe, minesweeper, memory, best scores
    ui/         small shared pieces
  data/         config.ts (edit me) + derived links
  lib/github/   API client, normalisation, cache, filtering, hook
  styles/       tokens, base, desktop, window, apps, mobile
public/         favicon, resume PDF, project images
```

## Accessibility notes

Keyboard reachable throughout, visible focus rings, labelled icon buttons,
Escape closes the start menu (and mobile panels), focus moves into windows
and panels when they open, status never relies on colour alone, and
`prefers-reduced-motion` disables animations. Windows drag only by the title
bar and only with a mouse or pen, never on touch.

The arcade games are fully playable by keyboard: the game tabs and the
Minesweeper board use arrow keys, every square and card has a label that
includes its state, and game results are announced to screen readers.