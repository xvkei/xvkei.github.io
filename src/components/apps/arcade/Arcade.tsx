import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Memory } from './Memory';
import { Minesweeper } from './Minesweeper';
import { TicTacToe } from './TicTacToe';

const GAMES = [
  { id: 'ttt', label: 'tic-tac-toe' },
  { id: 'mines', label: 'minesweeper' },
  { id: 'memory', label: 'memory' },
] as const;
type GameId = (typeof GAMES)[number]['id'];

export function Arcade() {
  const [active, setActive] = useState<GameId>('ttt');
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = GAMES.length - 1;
    let next: number;
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else return;
    e.preventDefault();
    setActive(GAMES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="app arcade">
      <p className="app-intro">a few tiny games for a coffee break. best scores stay on this device.</p>

      <div className="arcade-body">
        <div className="arcade-tabs" role="tablist" aria-label="Games">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${baseId}-tab-${g.id}`}
              type="button"
              role="tab"
              className="arcade-tab"
              aria-selected={active === g.id}
              aria-controls={`${baseId}-panel`}
              tabIndex={active === g.id ? 0 : -1}
              onClick={() => setActive(g.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="arcade-panel" role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${active}`}>
          {active === 'ttt' && <TicTacToe />}
          {active === 'mines' && <Minesweeper />}
          {active === 'memory' && <Memory />}
        </div>
      </div>
    </div>
  );
}