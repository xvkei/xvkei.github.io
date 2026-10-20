import { normalizeRepo } from './normalize';
import { GitHubError, type Repo } from './types';

const API_ROOT = 'https://api.github.com';
const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export const isAbortError = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError';

/** Fetches every public repository for a user (paginated). No token is ever sent. */
export async function fetchPublicRepos(
  username: string,
  { signal, maxPages = 5 }: { signal?: AbortSignal; maxPages?: number } = {},
): Promise<Repo[]> {
  const user = username.trim();
  if (!user) throw new GitHubError('config', 'No GitHub username is configured yet.');
  if (!USERNAME_RE.test(user)) throw new GitHubError('config', `"${user}" doesn't look like a valid GitHub username.`);

  const repos: Repo[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= maxPages; page += 1) {
    const url = `${API_ROOT}/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated&page=${page}`;
    let res: Response;
    try {
      res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal });
    } catch (err) {
      if (isAbortError(err)) throw err;
      throw new GitHubError('network', "Couldn't reach GitHub. Check your connection and try again.");
    }
    if (!res.ok) throw errorFromResponse(res, user);

    let data: unknown;
    try {
      data = await res.json();
    } catch (err) {
      if (isAbortError(err)) throw err;
      throw new GitHubError('parse', 'GitHub replied, but the response could not be read.');
    }
    if (!Array.isArray(data)) throw new GitHubError('parse', 'GitHub replied in an unexpected format.');

    for (const raw of data) {
      const repo = normalizeRepo(raw);
      if (repo && !seen.has(repo.id)) {
        seen.add(repo.id);
        repos.push(repo);
      }
    }

    const link = res.headers.get('link');
    const hasNext = link !== null ? /rel="next"/.test(link) : data.length === 100;
    if (!hasNext) break;
  }
  return repos;
}

function errorFromResponse(res: Response, user: string): GitHubError {
  const remaining = res.headers.get('x-ratelimit-remaining');
  if (res.status === 429 || (res.status === 403 && remaining === '0')) {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const resetAt = Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000) : null;
    const when = resetAt
      ? ` It resets around ${resetAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      : ' Please try again in a little while.';
    return new GitHubError('rate-limit', `GitHub's public API limit has been reached for your network.${when}`, resetAt);
  }
  if (res.status === 404) return new GitHubError('not-found', `GitHub couldn't find a user called "${user}".`);
  return new GitHubError('http', `GitHub responded with an error (${res.status}). Please try again.`);
}