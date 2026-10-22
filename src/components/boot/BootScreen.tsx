import { Monitor } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { site } from '../../data/config';

const STEPS = ['checking memory', 'mounting projects/', 'syncing github_archive/', 'warming up arcade.exe', 'brewing coffee', 'starting desktop'];
const SEGMENTS = 16;
const TICK_MS = 60;
const LEAVE_MS = 320;
const IGNORED_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock']);

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = () => window.matchMedia('(pointer: coarse)').matches;

export function BootScreen({ onDone }: { onDone: () => void }) {
  // reduced-motion visitors only see this via "reboot", so skip straight to the prompt
  const [pct, setPct] = useState(() => (prefersReducedMotion() ? 100 : 0));
  const [leaving, setLeaving] = useState(false);
  const [touch] = useState(isTouch);
  const leavingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const ready = pct >= 100;
  const shownLines = Math.ceil((pct / 100) * STEPS.length);
  const filledSegments = Math.round((pct / 100) * SEGMENTS);

  useEffect(() => {
    if (ready) return;
    const t = window.setInterval(() => setPct((p) => Math.min(100, Math.round(p + 2 + Math.random() * 3))), TICK_MS);
    return () => window.clearInterval(t);
  }, [ready]);

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (ready) enterRef.current?.focus({ preventScroll: true });
  }, [ready]);

  const enter = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    window.setTimeout(onDone, LEAVE_MS);
  }, [onDone]);

  /** Early input jumps to the prompt; input at the prompt enters the desktop. */
  const advance = useCallback(() => {
    if (ready) enter();
    else setPct(100);
  }, [ready, enter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // leave shortcuts like Ctrl+R, Alt+Tab and F12 alone
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || IGNORED_KEYS.has(e.key) || /^F\d+$/.test(e.key)) return;
      if (e.key === ' ' || e.key === 'Enter') e.preventDefault();
      advance();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [advance]);

  return (
    <div className={`boot${leaving ? ' is-leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={advance}>
      <div className="boot-card" ref={cardRef} tabIndex={-1}>
        <div className="boot-bar">
          <Monitor size={15} aria-hidden="true" />
          <p id={titleId} className="boot-title">{site.handle}.exe</p>
          <span className="boot-file" aria-hidden="true">boot.log</span>
        </div>

        <div className="boot-body">
          <p className="boot-kicker">{site.handle}.exe · personal archive · vol. 01</p>

          <ul className="boot-lines" aria-hidden="true">
            {STEPS.map((step, i) => (
              <li key={step} className={i < shownLines ? 'is-on' : undefined}>
                <span>{step}</span>
                <span className="boot-dots" />
                <span className="boot-ok">ok</span>
              </li>
            ))}
          </ul>

          <div className="boot-progress" aria-hidden="true">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span key={i} className={i < filledSegments ? 'is-on' : undefined} />
            ))}
          </div>

          {ready ? (
            <button
              ref={enterRef}
              type="button"
              className="boot-enter"
              onClick={(e) => {
                e.stopPropagation();
                enter();
              }}
            >
              <span className="boot-ok">ready.</span> {touch ? 'tap anywhere to enter' : 'press any key to enter'}
              <span className="boot-cursor" aria-hidden="true" />
            </button>
          ) : (
            <p className="boot-loading" aria-hidden="true">loading desktop… {pct}%</p>
          )}

          <p className="sr-only" role="status">{ready ? 'ready.' : `loading ${site.handle}.exe.`}</p>
        </div>
      </div>
    </div>
  );
}