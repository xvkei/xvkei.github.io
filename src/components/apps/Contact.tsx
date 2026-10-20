import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Copy, ExternalLink, FolderGit2, Link as LinkIcon, Mail } from 'lucide-react';
import { configuredEmail, getContactLinks, type ContactLink } from '../../data/links';
import { SetupNote } from '../ui/SetupNote';

const ICONS: Record<ContactLink['kind'], LucideIcon> = {
  email: Mail,
  github: FolderGit2,
  linkedin: Briefcase,
  link: LinkIcon,
};

export function Contact() {
  const links = getContactLinks();
  const email = configuredEmail();

  return (
    <div className="app contact">
      <p className="app-intro">where to find me:</p>
      {links.length === 0 ? (
        <SetupNote>
          No contact links configured. Add <code>contact.email</code>, <code>contact.linkedin</code> or{' '}
          <code>contact.other</code> in <code>src/data/config.ts</code>. GitHub appears automatically once the username is set.
        </SetupNote>
      ) : (
        <ul className="contact-list" role="list">
          {links.map((l) => {
            const Icon = ICONS[l.kind];
            return (
              <li key={l.id}>
                <a className="contact-row" href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  <span className="contact-icon" aria-hidden="true"><Icon size={18} /></span>
                  <span className="contact-label">{l.label}</span>
                  <span className="contact-value">{l.display}</span>
                  {l.external && (
                    <>
                      <ExternalLink className="ext-icon" size={14} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
      {email && <CopyEmail email={email} />}
    </div>
  );
}

function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const t = window.setTimeout(() => setStatus('idle'), 2500);
    return () => window.clearTimeout(t);
  }, [status]);

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(email);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <div className="copy-row">
      <button type="button" className="btn" onClick={() => void copy()}>
        <Copy size={15} aria-hidden="true" /> Copy email address
      </button>
      <span className="copy-status" role="status">
        {status === 'copied' ? 'copied to clipboard.' : status === 'failed' ? "couldn't copy — the address is shown above." : ''}
      </span>
    </div>
  );
}