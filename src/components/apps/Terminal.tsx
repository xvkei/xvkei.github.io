import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { APPS, APP_BY_ID, isAppEnabled, type AppCtx, type AppId } from '../../app/apps';
import { site } from '../../data/config';
import { getThemePref, setThemePref, type ThemePref } from '../../lib/theme';

type Line = { id: number; kind: 'in' | 'out' | 'err'; text: string };

const PROMPT = `${site.handle}@desktop:~$`;

const HELP: Array<[string, string]> = [
  ['help', 'show this list'],
  ['ls', 'list everything on the desktop'],
  ['open <name>', 'open an app, e.g. "open resume"'],
  ['projects', 'featured projects'],
  ['repos', 'the public GitHub archive'],
  ['about', 'about me'],
  ['resume', 'resume'],
  ['contact', 'contact details'],
  ['whoami', 'who runs this desktop'],
  ['date', 'your local date and time'],
  ['theme [name]', 'linen, night or system'],
  ['games', 'open the arcade'],
  ['coinflip', 'heads or tails'],
  ['roll [sides]', 'roll a die, e.g. "roll 20"'],
  ['guess [n]', 'guess my number from 1 to 100'],
  ['clear', 'clear the screen'],
];

// a Map, so prototype keys like "constructor" can never resolve to anything
const ALIASES = new Map<string, AppId>([
  ['projects', 'projects'], ['work', 'projects'],
  ['repos', 'archive'], ['archive', 'archive'], ['github', 'archive'],
  ['about', 'about'], ['resume', 'resume'], ['cv', 'resume'],
  ['contact', 'contact'], ['email', 'contact'],
  ['readme', 'readme'], ['notes', 'notes'], ['music', 'music'], ['arcade', 'arcade'], ['games', 'arcade'], ['terminal', 'terminal'],
  ['settings', 'settings'],
]);

const THEME_NAMES = new Map<string, ThemePref>([
  ['linen', 'linen'], ['light', 'linen'],
  ['night', 'night'], ['dark', 'night'],
  ['system', 'system'], ['auto', 'system'],
]);

function resolveApp(name: string): AppId | null {
  const n = name.toLowerCase().replace(/\/+$/, '');
  const alias = ALIASES.get(n);
  if (alias) return isAppEnabled(alias) ? alias : null;
  const match = APPS.find((a) => a.label.toLowerCase() === n || a.fileName.toLowerCase().replace(/\/+$/, '') === n);
  return match ? match.id : null;
}

/** A small, safe command set. Input is only ever matched against fixed commands — never evaluated. */
export function Terminal({ ctx }: { ctx: AppCtx }) {
  const idRef = useRef(0);
  const [lines, setLines] = useState<Line[]>(() => [
    { id: -2, kind: 'out', text: `${site.handle}.exe terminal — type "help" to see commands.` },
    { id: -1, kind: 'out', text: '(optional: everything here is also on the desktop and in the start menu.)' },
  ]);
  const [value, setValue] = useState('');
  const past = useRef<string[]>([]);
  const pastIndex = useRef(-1);
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const guessGame = useRef<{ secret: number; tries: number } | null>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const line = (kind: Line['kind'], text: string): Line => ({ id: idRef.current++, kind, text });

  const run = (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    past.current = [...past.current, input].slice(-50);
    pastIndex.current = -1;

    const out: Line[] = [line('in', input)];
    const say = (t: string) => out.push(line('out', t));
    const fail = (t: string) => out.push(line('err', t));
    const [cmd = '', ...args] = input.toLowerCase().split(/\s+/);
    let target: AppId | null = null;

    switch (cmd) {
      case 'help':
        say('available commands:');
        HELP.forEach(([c, d]) => say(`  ${c.padEnd(13)} ${d}`));
        break;
      case 'ls':
        APPS.forEach((a) => say(`  ${a.fileName.padEnd(20)} ${a.label}`));
        break;
      case 'open': {
        const name = args.join(' ');
        if (!name) {
          fail('open: which app? try "ls" to see what is here.');
          break;
        }
        target = resolveApp(name);
        if (!target) fail(`open: nothing called "${name}". try "ls".`);
        break;
      }
      case 'whoami':
        say([site.fullName ?? site.handle, site.role].filter(Boolean).join(' — '));
        break;
      case 'date':
        say(new Date().toLocaleString());
        break;
      case 'clear':
        setLines([]);
        return;
            case 'games':
      case 'play':
        target = 'arcade';
        break;
      case 'coinflip':
      case 'flip':
        say(Math.random() < 0.5 ? 'heads.' : 'tails.');
        break;
      case 'roll': {
        const sides = args[0] ? Number(args[0]) : 6;
        if (!Number.isInteger(sides) || sides < 2 || sides > 1000) {
          fail('roll: give a whole number of sides from 2 to 1000, e.g. "roll 20".');
          break;
        }
        say(`d${sides} → ${1 + Math.floor(Math.random() * sides)}`);
        break;
      }
      case 'guess': {
        const newSecret = () => 1 + Math.floor(Math.random() * 100);
        if (args.length === 0) {
          guessGame.current = { secret: newSecret(), tries: 0 };
          say('ok, i picked a number from 1 to 100. try "guess 50".');
          break;
        }
        const n = Number(args[0]);
        if (!Number.isInteger(n) || n < 1 || n > 100) {
          fail('guess: pick a whole number from 1 to 100.');
          break;
        }
        const game = guessGame.current ?? (guessGame.current = { secret: newSecret(), tries: 0 });
        game.tries += 1;
        if (n < game.secret) say(`${n} is too low.`);
        else if (n > game.secret) say(`${n} is too high.`);
        else {
          say(`yes! it was ${game.secret}. you got it in ${game.tries} ${game.tries === 1 ? 'try' : 'tries'}.`);
          guessGame.current = null;
        }
        break;
      }
      case 'theme': {
        if (args.length === 0) {
          say(`theme: ${getThemePref()}. options: linen, night, system.`);
          break;
        }
        const next = THEME_NAMES.get(args[0]);
        if (!next) {
          fail(`theme: no theme called "${args[0]}". try linen, night or system.`);
          break;
        }
        setThemePref(next);
        say(`theme set to ${next}.`);
        break;
      }
      default: {
        const app = args.length === 0 ? resolveApp(cmd) : null;
        if (app) target = app;
        else fail(`command not found: ${cmd}. type "help".`);
      }
    }

    if (target === 'terminal') {
      say("you're already here.");
      target = null;
    } else if (target) {
      say(`opening ${APP_BY_ID[target].fileName}`);
    }

    setLines((prev) => [...prev, ...out].slice(-200));
    if (target) ctx.openApp(target);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = past.current;
    if (h.length === 0) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = pastIndex.current < 0 ? h.length - 1 : Math.max(0, pastIndex.current - 1);
      pastIndex.current = i;
      setValue(h[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (pastIndex.current < 0) return;
      const i = pastIndex.current + 1;
      if (i >= h.length) {
        pastIndex.current = -1;
        setValue('');
      } else {
        pastIndex.current = i;
        setValue(h[i]);
      }
    }
  };

  return (
    <div className="terminal">
      <div className="term-log" ref={logRef} role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l) => (
          <p key={l.id} className={`term-line is-${l.kind}`}>
            {l.kind === 'in' && <span className="term-prompt" aria-hidden="true">{PROMPT}</span>}
            {l.text}
          </p>
        ))}
      </div>
      <form
        className="term-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
          setValue('');
        }}
      >
        <label htmlFor={inputId} className="term-prompt">
          <span aria-hidden="true">{PROMPT}</span>
          <span className="sr-only">Terminal command</span>
        </label>
        <input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
        />
      </form>
    </div>
  );
}