import type { LucideIcon } from 'lucide-react';
import { Braces, Bug, Coffee, Cpu, Database, GitBranch, Keyboard, Terminal as TerminalIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { unlock } from '../../../lib/achievements';
import { getBest, saveBest } from './scores';

type Card = { key: number; face: number; matched: boolean };

const FACES: Array<{ name: string; icon: LucideIcon }> = [
  { name: 'terminal', icon: TerminalIcon },
  { name: 'git', icon: GitBranch },
  { name: 'bug', icon: Bug },
  { name: 'coffee', icon: Coffee },
  { name: 'database', icon: Database },
  { name: 'braces', icon: Braces },
  { name: 'cpu', icon: Cpu },
  { name: 'keyboard', icon: Keyboard },
];
const FLIP_BACK_MS = 900;
const ELEPHANT_MOVES = 12;
const INTRO = `find all ${FACES.length} pairs in as few moves as you can.`;

function deal(): Card[] {
  const faces = FACES.flatMap((_, f) => [f, f]);
  for (let i = faces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [faces[i], faces[j]] = [faces[j], faces[i]];
  }
  return faces.map((face, key) => ({ key, face, matched: false }));
}

export function Memory() {
  const [cards, setCards] = useState<Card[]>(deal);
  const [up, setUp] = useState<number[]>([]); // face-up, unmatched card indexes (max 2)
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(() => getBest('memory'));
  const [message, setMessage] = useState(INTRO);

  // two face-up cards here always means "no match"; matches resolve immediately in flip()
  useEffect(() => {
    if (up.length !== 2) return;
    const t = window.setTimeout(() => setUp([]), FLIP_BACK_MS);
    return () => window.clearTimeout(t);
  }, [up]);

  const flip = (i: number) => {
    const card = cards[i];
    if (card.matched || up.includes(i)) return;
    const name = FACES[card.face].name;

    if (up.length !== 1) {
      setUp([i]);
      setMessage(`flipped ${name}.`);
      return;
    }

    const first = up[0];
    const n = moves + 1;
    setMoves(n);

    if (cards[first].face !== card.face) {
      setUp([first, i]);
      setMessage(`${FACES[cards[first].face].name} and ${name}: no match.`);
      return;
    }

    const next = cards.map((c, j) => (j === i || j === first ? { ...c, matched: true } : c));
    setCards(next);
    setUp([]);
    if (next.every((c) => c.matched)) {
      const isBest = saveBest('memory', n);
      if (isBest) setBest(n);
      setMessage(`all pairs found in ${n} moves.${isBest ? ' new best!' : ''}`);
      if (n <= ELEPHANT_MOVES) unlock('elephant-memory');
    } else {
      setMessage(`match: ${name}.`);
    }
  };

  const newGame = () => {
    setCards(deal());
    setUp([]);
    setMoves(0);
    setMessage(INTRO);
  };

  return (
    <div className="game">
      <div className="game-bar">
        <p className="game-stats">
          moves {moves}{best !== null && ` · best ${best}`}
        </p>
      </div>

      <p className="game-status" role="status">{message}</p>

      <div className="memory-board" role="group" aria-label="Memory cards">
        {cards.map((c, i) => {
          const shown = c.matched || up.includes(i);
          const { name, icon: Icon } = FACES[c.face];
          const cls = ['memory-card', shown && 'is-up', c.matched && 'is-matched'].filter(Boolean).join(' ');
          return (
            <button
              key={c.key}
              type="button"
              className={cls}
              aria-label={`card ${i + 1}: ${shown ? name : 'face down'}${c.matched ? ', matched' : ''}`}
              aria-disabled={c.matched}
              onClick={() => flip(i)}
            >
              {shown ? (
                <>
                  <Icon size={22} aria-hidden="true" />
                  <span className="memory-name">{name}</span>
                </>
              ) : (
                <span aria-hidden="true">?</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="game-controls">
        <button type="button" className="btn" onClick={newGame}>New game</button>
      </div>
    </div>
  );
}