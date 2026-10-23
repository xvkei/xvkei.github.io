import { Bomb, Flag } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { unlock } from '../../../lib/achievements';
import { getBest, saveBest } from './scores';

type Level = 'easy' | 'normal';
type Cell = { mine: boolean; adj: number; open: boolean; flag: boolean };
type Status = 'ready' | 'playing' | 'won' | 'lost';

const LEVELS: Record<Level, { size: number; mines: number; label: string }> = {
  easy: { size: 8, mines: 10, label: '8×8' },
  normal: { size: 10, mines: 16, label: '10×10' },
};
const LEVEL_IDS = Object.keys(LEVELS) as Level[];

const blank = (size: number): Cell[] =>
  Array.from({ length: size * size }, () => ({ mine: false, adj: 0, open: false, flag: false }));

function neighbors(i: number, size: number): number[] {
  const r = Math.floor(i / size);
  const c = i % size;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) out.push(nr * size + nc);
    }
  }
  return out;
}

/** Mines are planted on the first click, never on it or next to it. */
function plant(cells: Cell[], size: number, mines: number, safe: number): Cell[] {
  const banned = new Set([safe, ...neighbors(safe, size)]);
  const pool = cells.map((_, i) => i).filter((i) => !banned.has(i));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const mineSet = new Set(pool.slice(0, mines));
  return cells.map((cell, i) => ({
    ...cell,
    mine: mineSet.has(i),
    adj: neighbors(i, size).filter((n) => mineSet.has(n)).length,
  }));
}

/** Opens a cell, spreading outward through cells with no neighbouring mines. */
function flood(cells: Cell[], size: number, start: number): Cell[] {
  const next = cells.slice();
  const stack = [start];
  while (stack.length > 0) {
    const i = stack.pop();
    if (i === undefined) break;
    const cell = next[i];
    if (cell.open || cell.flag) continue;
    next[i] = { ...cell, open: true };
    if (cell.adj === 0) stack.push(...neighbors(i, size));
  }
  return next;
}

function describe(c: Cell): string {
  if (!c.open) return c.flag ? 'flagged' : 'hidden';
  if (c.mine) return 'mine';
  return c.adj ? `${c.adj} ${c.adj === 1 ? 'mine' : 'mines'} nearby` : 'clear';
}

export function Minesweeper() {
  const [level, setLevel] = useState<Level>('easy');
  const { size, mines } = LEVELS[level];
  const [cells, setCells] = useState<Cell[]>(() => blank(LEVELS.easy.size));
  const [status, setStatus] = useState<Status>('ready');
  const [seconds, setSeconds] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const [boom, setBoom] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [best, setBest] = useState(() => getBest('mines-easy'));
  const [message, setMessage] = useState('');
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (status !== 'playing') return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [status]);

  const over = status === 'won' || status === 'lost';
  const flags = cells.filter((c) => c.flag).length;

  const reset = (next: Level = level) => {
    setLevel(next);
    setCells(blank(LEVELS[next].size));
    setStatus('ready');
    setSeconds(0);
    setBoom(null);
    setFocus(0);
    setMessage('');
    setBest(getBest(`mines-${next}`));
  };

  const toggleFlag = (i: number) => {
    if (over || cells[i].open) return;
    setCells(cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  };

  const reveal = (i: number) => {
    if (over || cells[i].open || cells[i].flag) return;
    let board = cells;
    if (status === 'ready') {
      board = plant(board, size, mines, i);
      setStatus('playing');
    }
    if (board[i].mine) {
      setCells(board.map((c) => (c.mine ? { ...c, open: true } : c)));
      setBoom(i);
      setStatus('lost');
      setMessage('boom. that one was a mine. new game?');
      return;
    }
    board = flood(board, size, i);
    if (board.every((c) => c.mine || c.open)) {
      setCells(board.map((c) => (c.mine ? { ...c, flag: true } : c)));
      setStatus('won');
      const isBest = saveBest(`mines-${level}`, seconds);
      if (isBest) setBest(seconds);
      setMessage(`cleared in ${seconds}s.${isBest ? ' new best!' : ''}`);
      unlock('sweeper');
      return;
    }
    setCells(board);
  };

  const activate = (i: number) => (flagMode ? toggleFlag(i) : reveal(i));

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const r = Math.floor(i / size);
    const c = i % size;
    let next = -1;
    switch (e.key) {
      case 'ArrowUp': if (r > 0) next = i - size; break;
      case 'ArrowDown': if (r < size - 1) next = i + size; break;
      case 'ArrowLeft': if (c > 0) next = i - 1; break;
      case 'ArrowRight': if (c < size - 1) next = i + 1; break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFlag(i);
        return;
      default:
        return;
    }
    e.preventDefault();
    if (next >= 0) {
      setFocus(next);
      refs.current[next]?.focus();
    }
  };

  let hint = message;
  if (!hint && status === 'ready') hint = 'click any square to start. the first one is always safe.';
  else if (!hint) hint = flagMode ? 'flag mode is on: taps place flags.' : 'flag with right-click, the F key, or flag mode.';

  return (
    <div className="game">
      <div className="game-bar">
        <div className="seg" role="group" aria-label="Board size">
          {LEVEL_IDS.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => reset(l)}>
              {l} {LEVELS[l].label}
            </button>
          ))}
        </div>
        <p className="game-stats">
          mines left {mines - flags} · time {seconds}s{best !== null && ` · best ${best}s`}
        </p>
      </div>

      <p className="game-status" role="status">{hint}</p>

      <div className="mines-wrap">
        <div className="mines-board" role="grid" aria-label={`Minesweeper, ${size} by ${size}, ${mines} mines`}>
          {Array.from({ length: size }, (_, r) => (
            <div key={r} role="row" className="mines-row">
              {Array.from({ length: size }, (_, c) => {
                const i = r * size + c;
                const cell = cells[i];
                const cls = [
                  'mine-btn',
                  cell.open && 'is-open',
                  cell.open && cell.adj > 0 && !cell.mine && `n${cell.adj}`,
                  cell.flag && !cell.open && 'is-flag',
                  i === boom && 'is-boom',
                ].filter(Boolean).join(' ');
                return (
                  <div key={c} role="gridcell">
                    <button
                      ref={(el) => {
                        refs.current[i] = el;
                      }}
                      type="button"
                      className={cls}
                      tabIndex={i === focus ? 0 : -1}
                      aria-label={`row ${r + 1}, column ${c + 1}: ${describe(cell)}`}
                      onClick={() => activate(i)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        toggleFlag(i);
                      }}
                      onKeyDown={(e) => onKeyDown(e, i)}
                      onFocus={() => setFocus(i)}
                    >
                      {cell.open && cell.mine && <Bomb size={15} aria-hidden="true" />}
                      {cell.open && !cell.mine && cell.adj > 0 && cell.adj}
                      {!cell.open && cell.flag && <Flag size={14} aria-hidden="true" />}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="game-controls">
        <button type="button" className="game-toggle" aria-pressed={flagMode} onClick={() => setFlagMode((f) => !f)}>
          <Flag size={14} aria-hidden="true" /> flag mode
        </button>
        <button type="button" className="btn" onClick={() => reset()}>New game</button>
      </div>
    </div>
  );
}