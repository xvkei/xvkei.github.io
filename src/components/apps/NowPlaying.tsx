import { useCallback, useEffect, useRef, useState } from 'react';
import { Disc3, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { music } from '../../data/config';
import { safeHttpUrl } from '../../lib/url';
import { ExtLink } from '../ui/ExtLink';

/* ── minimal types for YouTube's IFrame Player API ── */
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  loadVideoById(id: string): void;
  setVolume(volume: number): void;
  destroy(): void;
};
type YTEvent = { target: YTPlayer; data: number };
type YTPlayerOptions = {
  videoId: string;
  host?: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (e: YTEvent) => void;
    onStateChange?: (e: YTEvent) => void;
    onError?: (e: YTEvent) => void;
  };
};
type YTNamespace = { Player: new (el: HTMLElement, options: YTPlayerOptions) => YTPlayer };

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

/** Loads YouTube's player script once, only when it's first needed. */
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT && typeof window.YT.Player === 'function') return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error('YouTube player failed to load'));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

/** Extracts the 11-character video ID from youtube.com / youtu.be / music.youtube.com links. */
function youTubeId(url: string | null | undefined): string | null {
  const safe = safeHttpUrl(url);
  if (!safe) return null;
  try {
    const u = new URL(safe);
    const host = u.hostname.replace(/^(www\.|m\.|music\.)/, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0] || null;
    else if (host === 'youtube.com') {
      id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

const IDS = music.items.map((t) => youTubeId(t.url));
const FIRST_PLAYABLE = IDS.findIndex((id) => id !== null);

/** Next/previous playable track index, wrapping around. */
function stepFrom(from: number, dir: 1 | -1): number | null {
  const n = IDS.length;
  for (let k = 1; k <= n; k += 1) {
    const i = (from + dir * k + n * n) % n;
    if (IDS[i]) return i;
  }
  return null;
}

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'blocked' | 'failed';

const STATUS_LABEL: Record<Status, string> = {
  idle: 'ready',
  loading: 'loading…',
  playing: 'playing',
  paused: 'paused',
  ended: 'stopped',
  blocked: "can't play here",
  failed: 'player unavailable',
};

export function NowPlaying() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const currentRef = useRef<number | null>(null);
  const volumeRef = useRef(70);
  const [current, setCurrent] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [volume, setVolume] = useState(70);
  const [hasPlayer, setHasPlayer] = useState(false);

  const play = useCallback(async (index: number) => {
    const id = IDS[index];
    if (!id) return;
    currentRef.current = index;
    setCurrent(index);

    const existing = playerRef.current;
    if (existing) {
      existing.loadVideoById(id);
      return;
    }

    setStatus('loading');
    let YT: YTNamespace;
    try {
      YT = await loadYouTubeApi();
    } catch {
      setStatus('failed');
      return;
    }
    const container = containerRef.current;
    if (!container || playerRef.current) return;

    // YouTube replaces this element with its iframe, so React never manages it directly
    const host = document.createElement('div');
    container.appendChild(host);
    playerRef.current = new YT.Player(host, {
      videoId: id,
      host: 'https://www.youtube-nocookie.com',
      width: '100%',
      height: '100%',
      playerVars: { playsinline: 1, rel: 0 },
      events: {
        onReady: (e) => {
          e.target.setVolume(volumeRef.current);
          e.target.playVideo();
        },
        onStateChange: (e) => {
          if (e.data === 1) setStatus('playing');
          else if (e.data === 2) setStatus('paused');
          else if (e.data === 3) setStatus('loading');
          else if (e.data === 0) {
            const from = currentRef.current;
            const next = from === null ? null : stepFrom(from, 1);
            if (next !== null && next !== from) {
              currentRef.current = next;
              setCurrent(next);
              e.target.loadVideoById(IDS[next] ?? '');
            } else {
              setStatus('ended');
            }
          }
        },
        onError: () => setStatus('blocked'),
      },
    });
    setHasPlayer(true);
  }, []);

  useEffect(
    () => () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    },
    [],
  );

  const toggle = () => {
    const player = playerRef.current;
    if (!player) {
      const start = current ?? FIRST_PLAYABLE;
      if (start >= 0) void play(start);
      return;
    }
    if (status === 'playing') player.pauseVideo();
    else player.playVideo();
  };

  const skip = (dir: 1 | -1) => {
    const target = stepFrom(current ?? (dir === 1 ? -1 : 0), dir);
    if (target !== null) void play(target);
  };

  const changeVolume = (value: number) => {
    setVolume(value);
    volumeRef.current = value;
    playerRef.current?.setVolume(value);
  };

  const track = current !== null ? music.items[current] : null;
  const anyPlayable = FIRST_PLAYABLE >= 0;
  const isPlaying = status === 'playing';

  return (
    <div className="app music">
      <div className="player">
        <div className="player-screen">
          <div ref={containerRef} className="player-video" />
          {!hasPlayer && (
            <div className="player-placeholder">
              <Disc3 size={36} aria-hidden="true" />
              <span>
                {!anyPlayable
                  ? 'add YouTube links to music.items in config.ts'
                  : status === 'loading'
                    ? 'loading the player…'
                    : status === 'failed'
                      ? "couldn't load the YouTube player — check your connection"
                      : 'press play to start'}
              </span>
            </div>
          )}
        </div>

        <div className="player-readout" aria-live="polite">
          <span className="player-label">{STATUS_LABEL[status]}</span>
          <span className="player-title">{track ? track.title : 'no track loaded'}</span>
          {track && <span className="player-artist">{track.artist}</span>}
        </div>

        <div className="player-controls">
          <button type="button" className="player-btn" onClick={() => skip(-1)} disabled={!anyPlayable} aria-label="Previous track">
            <SkipBack size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="player-btn player-btn-main"
            onClick={toggle}
            disabled={!anyPlayable}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          </button>
          <button type="button" className="player-btn" onClick={() => skip(1)} disabled={!anyPlayable} aria-label="Next track">
            <SkipForward size={16} aria-hidden="true" />
          </button>
          <label className="player-volume">
            <Volume2 size={16} aria-hidden="true" />
            <span className="sr-only">Volume</span>
            <input type="range" min={0} max={100} value={volume} onChange={(e) => changeVolume(Number(e.target.value))} />
          </label>
        </div>

        {status === 'blocked' && (
          <p className="player-msg">
            This upload can't be played on other sites. Try a different YouTube link for it — "Official Audio" or "Topic" uploads usually work.
          </p>
        )}
      </div>

      <div className="jcard">
        <p className="jcard-head">
          <span>side a</span>
          <span>{music.items.length} {music.items.length === 1 ? 'track' : 'tracks'}</span>
        </p>
        <ol className="tracklist">
          {music.items.map((t, i) => {
            const id = IDS[i];
            const link = safeHttpUrl(t.url);
            const isCurrent = i === current;
            const showPause = isCurrent && isPlaying;
            return (
              <li key={`${t.title}-${i}`} className={`track${isCurrent ? ' is-current' : ''}`} aria-current={isCurrent ? 'true' : undefined}>
                <span className="track-no">A{i + 1}</span>
                <span>
                  <span className="track-title">{t.title}</span>
                  <span className="track-artist">{t.artist}</span>
                  {t.note && <span className="track-note">{t.note}</span>}
                </span>
                {id ? (
                  <button
                    type="button"
                    className="track-play"
                    onClick={() => (isCurrent ? toggle() : void play(i))}
                    aria-label={`${showPause ? 'Pause' : 'Play'} ${t.title} by ${t.artist}`}
                  >
                    {showPause ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
                  </button>
                ) : link ? (
                  <ExtLink href={link} className="small">listen</ExtLink>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mono small muted">songs stream from YouTube · nothing loads until you press play</p>
    </div>
  );
}