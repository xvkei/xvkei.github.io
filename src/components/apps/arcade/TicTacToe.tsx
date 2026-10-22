import { useEffect, useState } from 'react';

type Mark = 'X' | 'O';
type Cell = Mark | null;
type Level = 'chill' | 'unbeatable';
/** winner null = draw */
type Result = { winner: Mark | null; line: number[] } | null;
type Tally = { you: number; cpu: number; draw: number };

const YOU: Mark = 'X';
const CPU: Mark = 'O';
const CPU_DELAY_MS = 350;
const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const LEVELS: Level[] = ['chill', 'unbeatable'];

const other = (m: Mark): Mark => (m === 'X' ? 'O' : 'X');
const empties = (b: Cell[]) => b.flatMap((c, i) => (c ? [] : [i]));
const place = (b: Cell[], i: number, m: Mark) => b.map((c, j) => (j === i ? m : c));
const emptyBoard = () => Array<Cell>(9).fill(null);

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

function getResult(b: Cell[]): Result {
  for (const line of LINES) {
    const [a, c, d] = line;
    const m = b[a];
    if (m && m === b[c] && m === b[d]) return { winner: m, line };
  }
  return b.every(Boolean) ? { winner: null, line: [] } : null;
}

function tallyFor(t: Tally, r: NonNullable<Result>): Tally {
  if (r.winner === YOU) return { ...t, you: t.you + 1 };
  if (r.winner === CPU) return { ...t, cpu: t.cpu + 1 };
  return { ...t, draw: t.draw + 1 };
}

/** Minimax score from the computer's point of view; quicker wins score higher. */
function score(b: Cell[], turn: Mark, depth: number): number {
  const r = getResult(b);
  if (r) return r.winner === CPU ? 10 - depth : r.winner === YOU ? depth - 10 : 0;
  const scores = empties(b).map((i) => score(place(b, i, turn), other(turn), depth + 1));
  return turn === CPU ? Math.max(...scores) : Math.min(...scores);
}

function cpuMove(b: Cell[], level: Level): number {
  const open = empties(b);
  const win = open.find((i) => getResult(place(b, i, CPU))?.winner === CPU);
  if (win !== undefined) return win;

  if (level === 'chill') {
    const block = open.find((i) => getResult(place(b, i, YOU))?.winner === YOU);
    if (block !== undefined && Math.random() < 0.5) return block;
    return pick(open);
  }

  if (open.length === 9) return pick([0, 2, 4, 6, 8]); // skip the full search on an empty board
  let best = -Infinity;
  let moves: number[] = [];
  for (const i of open) {
    const s = score(place(b, i, CPU), YOU, 1);
    if (s > best) {
      best = s;
      moves = [i];
    } else if (s === best) {
      moves.push(i);
    }
  }
  return pick(moves);
}

export function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(emptyBoard);
  const [starter, setStarter] = useState<Mark>(YOU);
  const [level, setLevel] = useState<Level>('chill');
  const [tally, setTally] = useState<Tally>({ you: 0, cpu: 0, draw: 0 });

  const result = getResult(board);
  const turn: Mark = (9 - empties(board).length) % 2 === 0 ? starter : other(starter);
  const cpuTurn = !result && turn === CPU;

  useEffect(() => {
    if (!cpuTurn) return;
    const t = window.setTimeout(() => {
      const next = place(board, cpuMove(board, level), CPU);
      setBoard(next);
      const r = getResult(next);
      if (r) setTally((prev) => tallyFor(prev, r));
    }, CPU_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [cpuTurn, board, level]);

  const play = (i: number) => {
    if (result || turn !== YOU || board[i]) return;
    const next = place(board, i, YOU);
    setBoard(next);
    const r = getResult(next);
    if (r) setTally((prev) => tallyFor(prev, r));
  };

  const newRound = () => {
    setBoard(emptyBoard());
    setStarter((s) => other(s));
  };

  const changeLevel = (next: Level) => {
    if (next === level) return;
    setLevel(next);
    setBoard(emptyBoard());
  };

  let status: string;
  if (result?.winner === YOU) status = 'you win! nice one.';
  else if (result?.winner === CPU) status = level === 'unbeatable' ? 'the computer wins. it was always going to.' : 'the computer takes this one.';
  else if (result) status = "it's a draw.";
  else status = turn === YOU ? `your turn. you're ${YOU}.` : 'computer is thinking…';

  return (
    <div className="game">
      <div className="game-bar">
        <div className="seg" role="group" aria-label="Difficulty">
          {LEVELS.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => changeLevel(l)}>
              {l}
            </button>
          ))}
        </div>
        <p className="game-stats">
          you {tally.you} · cpu {tally.cpu} · draws {tally.draw}
        </p>
      </div>

      <p className="game-status" role="status">{status}</p>

      <div className="ttt-board" role="group" aria-label="Tic-tac-toe board">
        {board.map((c, i) => {
          const win = result?.line.includes(i) ?? false;
          const cls = ['ttt-cell', c && `is-${c.toLowerCase()}`, win && 'is-win'].filter(Boolean).join(' ');
          return (
            <button
              key={i}
              type="button"
              className={cls}
              aria-label={`row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}: ${c ?? 'empty'}${win ? ', winning line' : ''}`}
              aria-disabled={Boolean(c) || Boolean(result) || turn !== YOU}
              onClick={() => play(i)}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="game-controls">
        <button type="button" className="btn" onClick={newRound}>New round</button>
      </div>
    </div>
  );
}