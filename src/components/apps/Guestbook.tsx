import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { guestbook } from '../../data/config';
import { fetchEntries, signGuestbook, type GuestbookEntry } from '../../lib/guestbook';
import { unlock } from '../../lib/achievements';

const NAME_KEY = 'haya.guestbook.name';
const LAST_KEY = 'haya.guestbook.last';
const COOLDOWN_MS = 60_000;

function readStore(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: still works for this visit */
  }
}

const dateFmt = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const errorText = (e: unknown) => (e instanceof Error ? e.message : 'something went wrong. try again?');

type ListState = 'loading' | 'ready' | 'error';
type FormNote = { kind: 'ok' | 'err'; text: string } | null;

export function Guestbook() {
  const nameId = useId();
  const messageId = useId();
  const countId = useId();
  const listId = useId();

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [list, setList] = useState<ListState>('loading');
  const [listError, setListError] = useState('');

  const [name, setName] = useState(() => readStore(NAME_KEY));
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState(''); // honeypot: people never see it, bots fill it in
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<FormNote>(null);
  const [newId, setNewId] = useState<number | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const rows = await fetchEntries(signal);
      setEntries(rows);
      setList('ready');
    } catch (e) {
      if (signal?.aborted) return;
      setListError(errorText(e));
      setList('error');
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    void load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const retry = () => {
    setList('loading');
    void load();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    const n = name.trim();
    const m = message.trim();
    if (!n || !m) {
      setNote({ kind: 'err', text: 'add a name and a message first.' });
      return;
    }
    if (trap) {
      // a bot filled in the hidden field: pretend it worked and send nothing
      setMessage('');
      setNote({ kind: 'ok', text: 'signed! thanks for stopping by.' });
      return;
    }
    const wait = Number(readStore(LAST_KEY) || 0) + COOLDOWN_MS - Date.now();
    if (wait > 0) {
      setNote({ kind: 'err', text: `you just signed! you can sign again in ${Math.ceil(wait / 1000)} seconds.` });
      return;
    }

    setSending(true);
    setNote(null);
    try {
      const entry = await signGuestbook(n, m);
      setEntries((prev) => [entry, ...prev]);
      setNewId(entry.id);
      setMessage('');
      writeStore(NAME_KEY, n);
      writeStore(LAST_KEY, String(Date.now()));
      setNote({ kind: 'ok', text: 'signed! thanks for stopping by.' });
      unlock('signed');
    } catch (err) {
      setNote({ kind: 'err', text: errorText(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="app guestbook">
      <p className="app-intro">
        thanks for stopping by! pick a name, leave a note, say hi. be nice, and please don't share anything
        private: every entry is public.
      </p>

      <form className="gb-form" onSubmit={(e) => void onSubmit(e)} noValidate>
        <div className="field">
          <label htmlFor={nameId}>name</label>
          <input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={guestbook.nameMax}
            autoComplete="nickname"
            placeholder="anonymous raccoon"
            required
          />
        </div>
        <div className="field">
          <label htmlFor={messageId}>message</label>
          <textarea
            id={messageId}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={guestbook.messageMax}
            rows={4}
            aria-describedby={countId}
            required
          />
          <span id={countId} className="gb-count">
            {message.length}/{guestbook.messageMax}
            <span className="sr-only"> characters</span>
          </span>
        </div>
        <div className="gb-trap" aria-hidden="true">
          <label>
            website
            <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </label>
        </div>
        <div className="gb-actions">
          <button type="submit" className="gb-submit" disabled={sending}>
            {sending ? 'signing…' : 'sign the guestbook'}
          </button>
          <p role="status" className={`gb-status${note ? ` is-${note.kind}` : ''}`}>
            {note?.text ?? ''}
          </p>
        </div>
      </form>

      <section aria-labelledby={listId}>
        <h4 id={listId}>signatures, newest first</h4>
        <div role="status">
          {list === 'loading' && <p className="state-line">loading the guestbook…</p>}
          {list === 'error' && <p className="state-line">{listError}</p>}
          {list === 'ready' && entries.length === 0 && <p className="state-line">no signatures yet. be the first!</p>}
        </div>
        {list === 'error' && (
          <button type="button" className="gb-retry" onClick={retry}>
            try again
          </button>
        )}
        {entries.length > 0 && (
          <ol className="gb-list">
            {entries.map((entry) => (
              <li key={entry.id} className={`gb-entry${entry.id === newId ? ' is-new' : ''}`}>
                <p className="gb-message">{entry.message}</p>
                <div className="gb-meta">
                  <span className="sr-only">signed by </span>
                  <span className="gb-name">{entry.name}</span>
                  <span aria-hidden="true"> · </span>
                  <time dateTime={entry.created_at}>{dateFmt.format(new Date(entry.created_at))}</time>
                  {entry.id === newId && <span> · just signed</span>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}