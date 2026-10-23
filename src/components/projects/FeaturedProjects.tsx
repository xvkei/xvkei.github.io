import { Archive } from 'lucide-react';
import type { AppCtx } from '../../app/apps';
import { featuredProjects, type FeaturedProject } from '../../data/config';
import { catalogNo } from '../../lib/format';
import { safeHttpUrl } from '../../lib/url';
import { ExtLink } from '../ui/ExtLink';
import { SampleButton } from '../ui/SampleButton';
import { SetupNote } from '../ui/SetupNote';
import { TagList } from '../ui/TagList';

export function FeaturedProjects({ ctx }: { ctx: AppCtx }) {
  const projects = featuredProjects.filter((p) => p.featured);

  return (
    <div className="app">
      <p className="app-intro">hand-picked work — each card opens its own detail file.</p>

      {projects.length === 0 ? (
        <SetupNote>
          No featured projects yet. Add entries to <code>featuredProjects</code> in <code>src/data/config.ts</code>.
        </SetupNote>
      ) : (
        <ol className="project-list" role="list">
          {projects.map((p, i) => (
            <li key={p.id}>
              <ProjectCard project={p} index={i} onOpen={ctx.openProject} />
            </li>
          ))}
        </ol>
      )}

      <div className="archive-cta">
        <p>Looking for everything else?</p>
        <button type="button" className="btn" onClick={() => ctx.openApp('archive')}>
          <Archive size={16} aria-hidden="true" /> Browse the public GitHub archive
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ project: p, index, onOpen }: { project: FeaturedProject; index: number; onOpen: (id: string) => void }) {
  const repo = safeHttpUrl(p.repositoryUrl);
  const demo = safeHttpUrl(p.demoUrl);
  const headingId = `proj-${p.id}`;

  return (
    <article className={`project-card${p.placeholder ? ' is-placeholder' : ''}`} aria-labelledby={headingId}>
      <div className="card-meta">
        <span>cat. no. {catalogNo(index)}</span>
        {p.category && <span>{p.category}</span>}
        {p.status && <span className="badge">{p.status}</span>}
        {p.placeholder && <span className="badge badge-placeholder">setup placeholder</span>}
      </div>
      <h3 id={headingId}>{p.name}</h3>
      <p>{p.shortDescription}</p>
      <TagList items={p.technologies} label={`Technologies used in ${p.name}`} />
      <div className="card-actions">
        <button type="button" className="btn btn-primary" onClick={() => onOpen(p.id)}>
          Open details<span className="sr-only"> for {p.name}</span>
        </button>
        {repo && <ExtLink className="btn" href={repo}>Repository</ExtLink>}
        {demo && <ExtLink className="btn" href={demo}>Live demo</ExtLink>}
        {p.image && <SampleButton image={p.image} projectName={p.name} />}
      </div>
    </article>
  );
}