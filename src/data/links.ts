import { safeHttpUrl } from '../lib/url';
import { contact, github } from './config';

export function githubProfileUrl(): string | null {
  return github.username ? `https://github.com/${encodeURIComponent(github.username)}` : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function configuredEmail(): string | null {
  const email = contact.email?.trim();
  return email && EMAIL_RE.test(email) ? email : null;
}

export type ContactLink = {
  id: string;
  kind: 'email' | 'github' | 'linkedin' | 'link';
  label: string;
  display: string;
  href: string;
  external: boolean;
};

const prettyUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export function getContactLinks(): ContactLink[] {
  const links: ContactLink[] = [];
  const email = configuredEmail();
  if (email) links.push({ id: 'email', kind: 'email', label: 'email', display: email, href: `mailto:${email}`, external: false });

  const gh = githubProfileUrl();
  if (gh) links.push({ id: 'github', kind: 'github', label: 'github', display: `github.com/${github.username}`, href: gh, external: true });

  const linkedin = safeHttpUrl(contact.linkedin);
  if (linkedin) links.push({ id: 'linkedin', kind: 'linkedin', label: 'linkedin', display: prettyUrl(linkedin), href: linkedin, external: true });

  contact.other.forEach((item, i) => {
    const href = safeHttpUrl(item.url);
    const label = item.label.trim();
    if (href && label) links.push({ id: `other-${i}`, kind: 'link', label: label.toLowerCase(), display: prettyUrl(href), href, external: true });
  });
  return links;
}