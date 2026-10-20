import { useId, useMemo, useState } from 'react';
import { RefreshCw, Search, TriangleAlert } from 'lucide-react';
import type { AppCtx } from '../../app/apps';
import { featuredProjects, github } from '../../data/config';
import { githubProfileUrl } from '../../data/links';
import { collectLanguages, collectTopics, filterRepos, type RepoSort } from '../../lib/github/filter';
import type { GitHubError, Repo } from '../../lib/github/types';
import { useRepos } from '../../lib/github/useRepos';
import { formatDate } from '../../lib/format';
import { ExtLink } from '../ui/ExtLink';
import { SetupNote } from '../ui/SetupNote';
import { TagList } from '../ui/TagList';

const plural = (n: number) => `${n} ${n === 1 ? 'repository' : 'repositories'}`;

export function RepoArchive({ ctx }: { ctx: AppCtx }) {
  const { status, error, repos, retry, configured } = useRepos();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [topic, setTopic] = useState('');
  const [sort, setSort] = useState<RepoSort>('updated');
  const uid = useId();
  const profile = githubProfileUrl();

  const languages = useMemo(() => collectLanguages(repos), [repos]);
  const topics = useMemo(() => collectTopics(repos), [repos]);
  const visible = useMemo(() => filterRepos(repos, { query, language, topic, sort }), [repos, query, language, topic, sort]);
  const filtered = query.trim() !== '' || language !== '' || topic !== '';
  const clearFilters = () => {
    setQuery('');
    setLanguage('');
    setTopic('');
  };

  return (
    <div className="archive">
      <div className="archive-head app-pad">
        <p className="app-intro">
          Every public repository, fetched live from GitHub{github.includeForks ? '' : ' — forks hidden'}.
        </p>
        {profile && <ExtLink href={profile} className="mono small">github.com/{github.username}</ExtLink>}
      </div>

      {!configured ? (
        <div className="archive-body app-pad">
          <SetupNote>
            Set your public GitHub username in <code>src/data/config.ts</code> (<code>GITHUB_USERNAME</code>) or as{' '}
            <code>VITE_GITHUB_USERNAME</code> in <code>.env</code>, then reload. No token is needed.
          </SetupNote>
          <FeaturedFallback ctx={ctx} />
        </div>
      ) : (
        <>
          <form className="archive-toolbar" role="search" aria-label="Filter repositories" onSubmit={(e) => e.preventDefault()}>
            <fieldset disabled={status !== 'success' || repos.length === 0}>
              <legend className="sr-only">Search, filter and sort</legend>
              <div className="field field-search">
                <label htmlFor={`${uid}-q`}>search</label>
                <div className="input-icon">
                  <Search size={15} aria-hidden="true" />
                  <input
                    id={`${uid}-q`}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="name, description or topic"
                    autoComplete="off"
                    spellCheck={false}
                    enterKeyHint="search"
                  />
                </div>
              </div>
              {languages.length > 0 && (
                <div className="field">
                  <label htmlFor={`${uid}-lang`}>language</label>
                  <select id={`${uid}-lang`} value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="">all languages</option>
                    {languages.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              )}
              {topics.length > 0 && (
                <div className="field">
                  <label htmlFor={`${uid}-topic`}>topic</label>
                  <select id={`${uid}-topic`} value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="">all topics</option>
                    {topics.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="field">
                <label htmlFor={`${uid}-sort`}>sort</label>
                <select id={`${uid}-sort`} value={sort} onChange={(e) => setSort(e.target.value as RepoSort)}>
                  <option value="updated">recently updated</option>
                  <option value="name">name (a–z)</option>
                </select>
              </div>
            </fieldset>
          </form>

          <div className="archive-body app-pad" aria-busy={status === 'loading'}>
            {status === 'loading' && (
              <p className="state-line" role="status">Fetching public repositories from GitHub…</p>
            )}

            {status === 'error' && error && <ArchiveError error={error} onRetry={retry} ctx={ctx} />}

            {status === 'success' && repos.length === 0 && (
              <div className="state-box">
                <h3>No public repositories to show yet</h3>
                <p>
                  GitHub returned no public repositories for this account
                  {github.includeForks ? '.' : ' (forks are hidden by default).'}
                </p>
              </div>
            )}

            {status === 'success' && repos.length > 0 && (
              <>
                <div className="result-row">
                  <p className="result-count" role="status">
                    {visible.length === repos.length ? plural(repos.length) : `${visible.length} of ${plural(repos.length)}`}
                  </p>
                  {filtered && (
                    <button type="button" className="link-btn small" onClick={clearFilters}>clear filters</button>
                  )}
                </div>
                {visible.length === 0 ? (
                  <div className="state-box">
                    <h3>Nothing matches those filters</h3>
                    <p>Try a different search term, or clear the filters.</p>
                    <button type="button" className="btn" onClick={clearFilters}>Clear filters</button>
                  </div>
                ) : (
                  <ul className="repo-list" role="list">
                    {visible.map((r) => (
                      <RepoItem key={r.id} repo={r} />
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function RepoItem({ repo }: { repo: Repo }) {
  const updated = formatDate(repo.updatedAt);
  const headingId = `repo-${repo.id}`;
  return (
    <li className="repo">
      <article aria-labelledby={headingId}>
        <h3 id={headingId} className="repo-name">
          <ExtLink href={repo.url}>{repo.name}</ExtLink>
        </h3>
        {repo.description ? (
          <p className="repo-desc">{repo.description}</p>
        ) : (
          <p className="repo-desc is-empty">No description provided.</p>
        )}
        <ul className="repo-meta" aria-label="Details">
          {repo.language && (
            <li><span className="sr-only">Language: </span>{repo.language}</li>
          )}
          {updated && (
            <li>updated <time dateTime={repo.updatedAt ?? undefined}>{updated}</time></li>
          )}
          {repo.isFork && <li>fork</li>}
          {repo.isArchived && <li>archived</li>}
        </ul>
        <TagList items={repo.topics} label="Topics" />
        {repo.homepage && (
          <p className="repo-links small">
            <ExtLink href={repo.homepage}>homepage</ExtLink>
          </p>
        )}
      </article>
    </li>
  );
}

function ArchiveError({ error, onRetry, ctx }: { error: GitHubError; onRetry: () => void; ctx: AppCtx }) {
  const canRetry = error.kind !== 'config';
  return (
    <div className="state-box is-error" role="alert">
      <h3><TriangleAlert size={18} aria-hidden="true" /> Couldn't load the archive</h3>
      <p>{error.message}</p>
      {canRetry ? (
        <button type="button" className="btn" onClick={onRetry}>
          <RefreshCw size={15} aria-hidden="true" /> Try again
        </button>
      ) : (
        <p className="small">Check <code>github.username</code> in <code>src/data/config.ts</code>.</p>
      )}
      <FeaturedFallback ctx={ctx} />
    </div>
  );
}

function FeaturedFallback({ ctx }: { ctx: AppCtx }) {
  const items = featuredProjects.filter((p) => p.featured);
  if (items.length === 0) return null;
  return (
    <div className="fallback">
      <p className="small">Meanwhile, the hand-picked projects are still here:</p>
      <ul>
        {items.map((p) => (
          <li key={p.id}>
            <button type="button" className="link-btn" onClick={() => ctx.openProject(p.id)}>{p.name}</button>
            {p.placeholder && <> <span className="badge badge-placeholder">setup placeholder</span></>}
          </li>
        ))}
      </ul>
    </div>
  );
}