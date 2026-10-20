import { useCallback, useEffect, useMemo, useState } from 'react';
import { github } from '../../data/config';
import { readCache, writeCache } from './cache';
import { fetchPublicRepos, isAbortError } from './client';
import { GitHubError, type Repo } from './types';

export type RepoStatus = 'idle' | 'loading' | 'success' | 'error';
type State = { status: RepoStatus; repos: Repo[]; error: GitHubError | null };

export function useRepos() {
  const { username, maxPages, cacheMinutes, includeForks, includeArchived } = github;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State>(() => {
    const cached = readCache(username, cacheMinutes);
    if (cached) return { status: 'success', repos: cached, error: null };
    return { status: username ? 'loading' : 'idle', repos: [], error: null };
  });

  useEffect(() => {
    if (!username) return;
    if (attempt === 0 && readCache(username, cacheMinutes)) {
      setState((prev) => (prev.status === 'success' ? prev : { status: 'success', repos: readCache(username, cacheMinutes) ?? [], error: null }));
      return;
    }
    const controller = new AbortController();
    setState((prev) => (prev.status === 'loading' ? prev : { status: 'loading', repos: prev.repos, error: null }));

    fetchPublicRepos(username, { signal: controller.signal, maxPages })
      .then((repos) => {
        if (controller.signal.aborted) return;
        writeCache(username, repos);
        setState({ status: 'success', repos, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isAbortError(err)) return;
        const error = err instanceof GitHubError ? err : new GitHubError('network', 'Something went wrong while loading repositories.');
        setState((prev) => ({ status: 'error', repos: prev.repos, error }));
      });

    return () => controller.abort(); // ignore stale requests on unmount / retry
  }, [username, maxPages, cacheMinutes, attempt]);

  const repos = useMemo(
    () => state.repos.filter((r) => (includeForks || !r.isFork) && (includeArchived || !r.isArchived)),
    [state.repos, includeForks, includeArchived],
  );
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { status: state.status, error: state.error, repos, retry, configured: username !== '' };
}