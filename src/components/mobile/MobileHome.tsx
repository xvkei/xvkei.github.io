import { Archive, Trophy } from 'lucide-react';
import { APPS, type AppCtx } from '../../app/apps';
import { featuredProjects, site } from '../../data/config';
import { catalogNo } from '../../lib/format';
import { AppTile } from '../desktop/AppTile';
import { SetupNote } from '../ui/SetupNote';
import { useAchievements } from '../../lib/achievements';

export function MobileHome({ ctx }: { ctx: AppCtx }) {
  const featured = featuredProjects.filter((p) => p.featured);
  const identity = [site.fullName, site.role].filter(Boolean).join(' · ');
  const { found, total } = useAchievements();

  return (
    <main className="m-home">
      <header className="m-home-head">
        <p className="m-kicker mono">{site.handle}.exe</p>
        <h1>{site.handle}'s desktop</h1>
        {identity && <p className="m-identity">{identity}</p>}
        <div className="m-note">
          <p className="note-file">note_to_visitors.txt</p>
          <p className="note-text">{site.welcome}</p>
        </div>
      </header>

      <section className="m-section" aria-labelledby="m-featured-title">
        <div className="m-section-head">
          <h2 id="m-featured-title" className="m-section-title">featured projects</h2>
          <button type="button" className="link-btn" onClick={() => ctx.openApp('projects')}>see all</button>
        </div>
        {featured.length === 0 ? (
          <SetupNote>
            No featured projects yet. Add them to <code>featuredProjects</code> in <code>src/data/config.ts</code>.
          </SetupNote>
        ) : (
          <ul className="m-featured" role="list">
            {featured.map((p, i) => (
              <li key={p.id}>
                <button type="button" className="m-feature" onClick={() => ctx.openProject(p.id)}>
                  <span className="card-meta">
                    <span>cat. no. {catalogNo(i)}</span>
                    {p.placeholder && <span className="badge badge-placeholder">setup placeholder</span>}
                  </span>
                  <span className="m-feature-name">{p.name}</span>
                  <span className="m-feature-desc">{p.shortDescription}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-block" onClick={() => ctx.openApp('archive')}>
          <Archive size={16} aria-hidden="true" /> Browse all public repositories
        </button>
        <button type="button" className="btn btn-block" data-app-icon="achievements" onClick={() => ctx.openApp('achievements')}>
          <Trophy size={16} aria-hidden="true" /> achievements · {found}/{total} found
        </button>
      </section>

      <section className="m-section" aria-labelledby="m-apps-title">
        <h2 id="m-apps-title" className="m-section-title">apps</h2>
        <ul className="m-launcher" role="list">
          {APPS.map((app) => (
            <li key={app.id}>
              <button type="button" className="m-app" data-app-icon={app.id} onClick={() => ctx.openApp(app.id)}>
                <AppTile app={app} />
                <span className="m-app-name">{app.label}</span>
                <span className="m-app-file">
                  {app.fileName} — {app.blurb}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="m-foot mono" aria-hidden="true">{site.handle}.exe · personal archive · vol. 01</p>
    </main>
  );
}