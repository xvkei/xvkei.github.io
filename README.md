# haya.exe

A cozy personal-computer portfolio. On wide screens it's a desktop with draggable,
resizable windows; on phones and tablets it becomes a single-column launcher with
full-screen panels and a bottom dock. There's also a small arcade for a coffee
break, a guestbook to sign, hidden achievements to find, and light and dark themes.

Built with React, TypeScript, Vite, plain CSS and lucide-react icons.
Live at [xvkei.github.io](https://xvkei.github.io).

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
  once an entry is real. Images go in `public/images/` and are referenced as
  `images/file.jpg` with their real width and height. A project with an image
  gets a **View sample** button on its card and detail view, which opens the
  image large in a lightbox. Keep images around 1200 px wide and under
  ~300 KB.
- **Resume:** put the PDF at `public/resume.pdf` and set
  `resume.pdfPath: 'resume.pdf'`. `summary`, `experience` and `education`
  fill the readable HTML version.
- **Contact:** `contact.email`, `contact.linkedin`, `contact.other`. Unset
  links are hidden. GitHub appears automatically once the username is set.
- **Notes / Now playing:** optional; hidden until they have content (`notes`
  also needs `enabled: true`). Now playing is a small music player that plays
  each track's YouTube link in an embedded player.
- **Guestbook:** `guestbook.url` and `guestbook.publishableKey` from your
  Supabase project. Hidden while either is empty. See [Guestbook](#guestbook).

## Desktop

- **Windows** drag by the title bar and resize from any edge or corner
  (minimum 300×200). Double-click an edge to reset a window's size. Dragging
  and resizing only work with a mouse or pen, never on touch.
- **Themes:** linen (light), night (dark), or "match my device", which follows
  the system setting live. Change it in `settings.app`, with the sun/moon
  button in the taskbar, or with `theme [name]` in the terminal. The choice is
  saved in localStorage under `haya.theme`, and a small inline script in
  `index.html` applies it before the first paint, so there's no flash of the
  wrong theme. All colours come from CSS variables in `src/styles/tokens.css`.
- **Boot screen:** a short startup sequence that waits for "press any key to
  enter". It shows once per browser session (sessionStorage `haya.booted`),
  and is skipped for deep links (URLs that open a specific app) and for
  visitors who prefer reduced motion. `reboot` in the terminal replays it.

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

## Guestbook

`guestbook.txt` lets visitors pick a name and leave a message, no account
needed. Every entry is public and shown newest first.

Entries are stored in a [Supabase](https://supabase.com) table and read and
written straight from the browser with plain `fetch` (no SDK), in
`src/lib/guestbook.ts`.

**Setup**

1. Create a free Supabase project.
2. Open the SQL Editor, paste in `supabase/guestbook.sql`, and run it. This
   creates the table, its row level security policies and a small trigger.
3. Copy the Project URL and the publishable key (`sb_publishable_…`) into
   `guestbook` in `src/data/config.ts`.

Both values are public by design: the database's row level security decides
what visitors can do, which is read entries and add new ones, never edit or
delete. **Never** put the secret or `service_role` key in the site.

**Limits and spam protection**

- Names are 1–32 characters and messages 1–500, enforced by the database.
  Visitors can only fill in `name` and `message`; the id and date are set by
  the database, so they can't be faked.
- A trigger trims extra spaces and allows at most 10 new entries per minute
  across the whole site.
- A hidden honeypot field catches basic bots, and each browser has a
  60-second cooldown between signatures.
- React escapes everything visitors type, so messages can't inject HTML or
  scripts.

**Moderation:** delete entries from the Supabase Table Editor (tick the row,
then delete).

**Keep-alive:** free Supabase projects pause after a week without activity.
`.github/workflows/supabase-keepalive.yml` reads one row every Monday and
Thursday to keep it awake, and can also be run by hand from the Actions tab.
GitHub turns off scheduled workflows in repos with no commits for 60 days; if
that happens, re-enable it in the Actions tab.

## Achievements

Little secrets hidden around the desktop reward visitors for exploring, not
just for playing the games. Unlocking one shows an "achievement unlocked"
pop-up, and `achievements.log` lists everything found so far, with locked
ones shown as "???" plus a small hint. Open it from the start menu, the
mobile home screen, or `achievements` in the terminal.

- The list lives in `src/lib/achievements.ts`. Each achievement has a name,
  a description (shown once unlocked) and a hint (shown while locked).
- To unlock one from anywhere in the code, call `unlock('id')`. It returns
  `true` the first time, so callers can react to a fresh unlock.
- Progress is saved in localStorage under `haya.achievements.v1`, and the
  apps a visitor has opened under `haya.explored.v1`. A "start over" button
  in `achievements.log` resets both.

## Terminal

`terminal.app` is an optional way to get around. Input is only ever matched
against a fixed list of commands, never evaluated. Type `help` to see them all:

- `ls`, `open <name>`, or just an app's name (`projects`, `resume`,
  `contact`, `guestbook`, …) to open windows
- `achievements` to see the secrets you've found
- `theme [linen | night | system]` to switch themes
- `games` to open the arcade, plus `coinflip`, `roll [sides]` and
  `guess [n]` (a 1–100 number guessing game)
- `whoami`, `date`, `clear`, and `reboot` to replay the boot screen

There may also be a command or two that `help` doesn't mention.

## Privacy

There are no analytics, cookies or accounts. Arcade scores, achievements, the
theme choice, and the name you last signed the guestbook with stay in your own
browser's storage. The only thing sent anywhere is a guestbook entry you choose
to post, which goes to Supabase and is shown publicly.

## Deploying

`npm run build` produces a static site in `dist/`.

- **GitHub Pages (this repo):** a GitHub Actions workflow in
  `.github/workflows/` builds and deploys on every push to `main`.
  `vite.config.ts` uses `base: './'`, so the build also works from a
  repository sub-path.
- **Netlify / Vercel / Cloudflare Pages:** build command `npm run build`,
  output directory `dist`. If you use the env var instead of editing
  config.ts, add `VITE_GITHUB_USERNAME` in the host's settings.

## Structure

```
src/
  app/            app registry, window manager reducer, hash routes
  components/
    boot/         boot screen
    desktop/      desktop shell, icons, taskbar, start menu
    window/       draggable, resizable window frame
    mobile/       launcher, full-screen panels, dock
    projects/     featured projects, detail view, GitHub archive
    apps/         about, resume, contact, notes, now playing, guestbook,
                  achievements, settings, readme, terminal
      arcade/     arcade window, tic-tac-toe, minesweeper, memory, best scores
    ui/           small shared pieces (links, tags, sample viewer,
                  achievement pop-up)
  data/           config.ts (edit me) + derived links
  lib/
    github/          API client, normalisation, cache, filtering, hook
    guestbook.ts     Supabase client for the guestbook
    achievements.ts  achievement list and progress store
    theme.ts         theme store
    boot.ts          boot screen state
  styles/         tokens, base, desktop, window, apps, mobile
public/           favicon, resume PDF, project images
supabase/         guestbook.sql (database setup)
.github/workflows/  deploy + Supabase keep-alive
```

## Accessibility notes

Keyboard reachable throughout, visible focus rings, labelled icon buttons,
Escape closes the start menu (and mobile panels), focus moves into windows
and panels when they open, status never relies on colour alone, and
`prefers-reduced-motion` disables animations and the boot screen. Windows drag
and resize only with a mouse or pen, never on touch.

The arcade games are fully playable by keyboard: the game tabs and the
Minesweeper board use arrow keys, every square and card has a label that
includes its state, and game results are announced to screen readers.

The guestbook form has labelled fields and a character counter, and loading,
errors and successful signatures are announced to screen readers. The
View sample lightbox uses a native `<dialog>`, so focus stays inside while
it's open, Escape closes it, and focus returns to the button afterwards.

Achievement pop-ups are announced to screen readers, can be dismissed with a
button, and disappear on their own after a few seconds; everything they say
is also listed in `achievements.log`, where locked entries are labelled as
locked rather than read out as "???".