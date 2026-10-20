import type { AppCtx } from '../../app/apps';
import { featuredProjects } from '../../data/config';
import { catalogNo, resolveAsset } from '../../lib/format';
import { safeHttpUrl } from '../../lib/url';
import { ExtLink } from '../ui/ExtLink';
import { SetupNote } from '../ui/SetupNote';
import { TagList } from '../ui/TagList';

export function ProjectDetail({ ctx }: { ctx: AppCtx }) {
  const index = featuredProjects.findIndex((p) => p.id === ctx.projectId);
  const project = index >= 0 ? featuredProjects[index] : null;

  if (!project) {
    return (
      <div className="app">
        <div className="state-box">
          <h3>No project selected</h3>
          <p>Pick one from the featured projects list.</p>
          <button type="button" className="btn" onClick={() => ctx.openApp('projects')}>Open featured projects</button>
        </div>
      </div>
    );
  }

  const repo = safeHttpUrl(project.repositoryUrl);
  const demo = safeHttpUrl(project.demoUrl);
  const headingId = `detail-${project.id}`;

  return (
    <article className="app detail" aria-labelledby={headingId}>
      <header className="detail-head">
        <div className="card-meta">
          <span>cat. no. {catalogNo(index)}</span>
          {project.category && <span>{project.category}</span>}
          {project.status && <span className="badge">{project.status}</span>}
          {project.placeholder && <span className="badge badge-placeholder">setup placeholder</span>}
        </div>
        <h3 id={headingId}>{project.name}</h3>
        <p className="detail-lead">{project.shortDescription}</p>
        {(repo || demo) && (
          <div className="card-actions">
            {repo && <ExtLink className="btn btn-primary" href={repo}>View repository</ExtLink>}
            {demo && <ExtLink className="btn" href={demo}>Open live demo</ExtLink>}
          </div>
        )}
      </header>

      {project.image && (
        <figure className="detail-figure">
          <img
            src={resolveAsset(project.image.src)}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            loading="lazy"
            decoding="async"
          />
        </figure>
      )}

      {project.problem && (
        <section>
          <h4>the problem</h4>
          <p>{project.problem}</p>
        </section>
      )}
      {project.longDescription && (
        <section>
          <h4>overview</h4>
          <p>{project.longDescription}</p>
        </section>
      )}
      {project.features && project.features.length > 0 && (
        <section>
          <h4>main features</h4>
          <ul className="bullets">
            {project.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}
      {project.technologies.length > 0 && (
        <section>
          <h4>built with</h4>
          <TagList items={project.technologies} label="Technologies" />
        </section>
      )}
      {project.personalContribution && (
        <section>
          <h4>my contribution</h4>
          <p>{project.personalContribution}</p>
        </section>
      )}

      {project.placeholder && (
        <SetupNote>
          This entry is a template. Replace it in <code>featuredProjects</code> (<code>src/data/config.ts</code>) and remove{' '}
          <code>placeholder: true</code>.
        </SetupNote>
      )}
    </article>
  );
}