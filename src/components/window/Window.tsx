import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Copy, Minus, Square, X } from 'lucide-react';
import { APP_BY_ID, type AppId } from '../../app/apps';
import { WINDOW_MARGIN, type WinState } from '../../app/windows';

type Props = {
  id: AppId;
  title: string;
  fileName: string;
  icon: LucideIcon;
  win: WinState;
  active: boolean;
  onFocus: (id: AppId) => void;
  onClose: (id: AppId) => void;
  onMinimize: (id: AppId) => void;
  onToggleMax: (id: AppId) => void;
  onMove: (id: AppId, x: number, y: number) => void;
  children: ReactNode;
};

type Drag = { pointerId: number; startX: number; startY: number; originX: number; originY: number; maxX: number; maxY: number; x: number; y: number };

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"]';
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

export function Window({ id, title, fileName, icon: Icon, win, active, onFocus, onClose, onMinimize, onToggleMax, onMove, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<Drag | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const titleId = `win-${id}-title`;
  const { w, h } = APP_BY_ID[id].size;

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    // title bar only; never on touch (keeps scrolling/tapping natural) or from controls
    if (win.maximized || e.button !== 0 || e.pointerType === 'touch') return;
    if ((e.target as Element).closest(INTERACTIVE)) return;
    const el = ref.current;
    const area = el?.parentElement;
    if (!el || !area) return;
    e.preventDefault();
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: win.x,
      originY: win.y,
      maxX: area.clientWidth - el.offsetWidth,
      maxY: area.clientHeight - el.offsetHeight,
      x: win.x,
      y: win.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragPos({ x: win.x, y: win.y });
  };

  const moveDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    d.x = clamp(d.originX + e.clientX - d.startX, 0, d.maxX);
    d.y = clamp(d.originY + e.clientY - d.startY, 0, d.maxY);
    setDragPos({ x: d.x, y: d.y });
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    onMove(id, d.x, d.y);
    setDragPos(null);
  };

  const pos = dragPos ?? { x: win.x, y: win.y };
  const style: CSSProperties = win.maximized
    ? { zIndex: win.z, width: '100%', height: '100%' }
    : {
        zIndex: win.z,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        width: `min(${w}px, calc(100% - ${WINDOW_MARGIN * 2}px))`,
        height: `min(${h}px, calc(100% - ${WINDOW_MARGIN * 2}px))`,
      };
  const className = ['win', active && 'is-active', win.maximized && 'is-max', dragPos && 'is-dragging'].filter(Boolean).join(' ');

  return (
    <section
      ref={ref}
      id={`win-${id}`}
      className={className}
      style={style}
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={win.minimized}
      onPointerDownCapture={() => onFocus(id)}
      onFocusCapture={() => onFocus(id)}
    >
      <div
        className="win-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          if (!(e.target as Element).closest(INTERACTIVE)) onToggleMax(id);
        }}
      >
        <Icon className="win-icon" size={15} strokeWidth={2} aria-hidden="true" />
        <h2 id={titleId} className="win-title">{title}</h2>
        <span className="win-file" aria-hidden="true">{fileName}</span>
        <div className="win-controls">
          <button type="button" className="win-ctrl" aria-label={`Minimize ${title}`} title="Minimize" onClick={() => onMinimize(id)}>
            <Minus size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="win-ctrl"
            aria-label={`${win.maximized ? 'Restore' : 'Maximize'} ${title}`}
            title={win.maximized ? 'Restore' : 'Maximize'}
            onClick={() => onToggleMax(id)}
          >
            {win.maximized ? <Copy size={13} aria-hidden="true" /> : <Square size={12} aria-hidden="true" />}
          </button>
          <button type="button" className="win-ctrl is-close" aria-label={`Close ${title}`} title="Close" onClick={() => onClose(id)}>
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="win-body">{children}</div>
    </section>
  );
}