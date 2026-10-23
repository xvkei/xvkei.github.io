import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Copy, Minus, Square, X } from 'lucide-react';
import { APP_BY_ID, type AppId } from '../../app/apps';
import { MIN_SIZE, WINDOW_MARGIN, type Rect, type WinState } from '../../app/windows';
import { unlock } from '../../lib/achievements';

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
  onResize: (id: AppId, rect: Rect) => void;
  children: ReactNode;
};

type Drag = { pointerId: number; startX: number; startY: number; originX: number; originY: number; maxX: number; maxY: number; x: number; y: number };

const EDGES = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;
type Edge = (typeof EDGES)[number];
type Resize = {
  pointerId: number;
  edge: Edge;
  startX: number;
  startY: number;
  origin: Rect;
  areaW: number;
  areaH: number;
  rect: Rect;
};

const INTERACTIVE = 'button, a, input, select, textarea, [role="button"]';
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/** New rectangle for a resize in progress, kept inside the desktop and above the minimum size. */
function resizedRect(r: Resize, clientX: number, clientY: number): Rect {
  const { origin: o, edge } = r;
  const dx = clientX - r.startX;
  const dy = clientY - r.startY;
  const maxW = r.areaW - WINDOW_MARGIN * 2;
  const maxH = r.areaH - WINDOW_MARGIN * 2;
  let { x, y, w, h } = o;

  if (edge.includes('e')) w = clamp(o.w + dx, MIN_SIZE.w, Math.min(maxW, r.areaW - o.x));
  if (edge.includes('s')) h = clamp(o.h + dy, MIN_SIZE.h, Math.min(maxH, r.areaH - o.y));
  if (edge.includes('w')) {
    const right = o.x + o.w;
    x = clamp(o.x + dx, Math.max(0, right - maxW), right - MIN_SIZE.w);
    w = right - x;
  }
  if (edge.includes('n')) {
    const bottom = o.y + o.h;
    y = clamp(o.y + dy, Math.max(0, bottom - maxH), bottom - MIN_SIZE.h);
    h = bottom - y;
  }
  return { x, y, w, h };
}

export function Window({ id, title, fileName, icon: Icon, win, active, onFocus, onClose, onMinimize, onToggleMax, onMove, onResize, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<Drag | null>(null);
  const resize = useRef<Resize | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [liveRect, setLiveRect] = useState<Rect | null>(null);
  const titleId = `win-${id}-title`;

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

  const startResize = (e: ReactPointerEvent<HTMLDivElement>, edge: Edge) => {
    // mouse/pen only, same rule as dragging
    if (win.maximized || e.button !== 0 || e.pointerType === 'touch') return;
    const el = ref.current;
    const area = el?.parentElement;
    if (!el || !area) return;
    e.preventDefault();
    e.stopPropagation();
    // measure the rendered size; CSS may have shrunk the window to fit a small viewport
    const origin: Rect = { x: win.x, y: win.y, w: el.offsetWidth, h: el.offsetHeight };
    resize.current = {
      pointerId: e.pointerId,
      edge,
      startX: e.clientX,
      startY: e.clientY,
      origin,
      areaW: area.clientWidth,
      areaH: area.clientHeight,
      rect: origin,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setLiveRect(origin);
  };

  const moveResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = resize.current;
    if (!r || r.pointerId !== e.pointerId) return;
    r.rect = resizedRect(r, e.clientX, e.clientY);
    setLiveRect(r.rect);
  };

  const endResize = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = resize.current;
    if (!r || r.pointerId !== e.pointerId) return;
    resize.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    onResize(id, r.rect);
    setLiveRect(null);
    // only a real change in size counts, not a click on an edge
    if (r.rect.w !== r.origin.w || r.rect.h !== r.origin.h) unlock('interior-designer');
  };

  const resetSize = () => onResize(id, { x: win.x, y: win.y, ...APP_BY_ID[id].size });

  const pos = dragPos ?? { x: win.x, y: win.y };
  const rect = liveRect ?? { ...pos, w: win.w, h: win.h };
  const style: CSSProperties = win.maximized
    ? { zIndex: win.z, width: '100%', height: '100%' }
    : {
        zIndex: win.z,
        transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
        width: `min(${rect.w}px, calc(100% - ${WINDOW_MARGIN * 2}px))`,
        height: `min(${rect.h}px, calc(100% - ${WINDOW_MARGIN * 2}px))`,
      };
  const className = ['win', active && 'is-active', win.maximized && 'is-max', dragPos && 'is-dragging', liveRect && 'is-resizing']
    .filter(Boolean)
    .join(' ');

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

      {!win.maximized &&
        EDGES.map((edge) => (
          <div
            key={edge}
            className={`win-resize is-${edge}`}
            aria-hidden="true"
            onPointerDown={(e) => startResize(e, edge)}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            onDoubleClick={resetSize}
          />
        ))}
    </section>
  );
}