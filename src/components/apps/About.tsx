import type { AppCtx } from '../../app/apps';
import { about, site } from '../../data/config';
import { resolveAsset } from '../../lib/format';
import { SetupNote } from '../ui/SetupNote';
import { TagList } from '../ui/TagList';
import { SkillGroups } from './SkillGroups';

export function About({ ctx }: { ctx: AppCtx }) {
  const name = site.fullName ?? site.handle;

  return (
    <div className="app about">
      <div className="about-head">
        <div className="avatar">
          {about.photo ? (
            <img
              src={resolveAsset(about.photo.src)}
              alt={about.photo.alt}
              width={about.photo.width}
              height={about.photo.height}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h3>{name}</h3>
          {site.role && <p className="about-role">{site.role}</p>}
          {site.location && <p className="mono small muted">{site.location}</p>}
        </div>
      </div>

      <section aria-labelledby="about-hello">
        <h4 id="about-hello">hello</h4>
        {about.intro.length > 0 ? (
          about.intro.map((para, i) => <p key={i}>{para}</p>)
        ) : (
          <SetupNote>
            Write a short introduction in <code>about.intro</code> (one string per paragraph) in <code>src/data/config.ts</code>.
          </SetupNote>
        )}
      </section>

      <section aria-labelledby="about-interests">
        <h4 id="about-interests">professional interests</h4>
        {about.interests.length > 0 ? (
          <TagList items={about.interests} label="Professional interests" />
        ) : (
          <SetupNote>List a few interests in <code>about.interests</code>.</SetupNote>
        )}
      </section>

      <section aria-labelledby="about-skills">
        <h4 id="about-skills">skills &amp; tools</h4>
        <SkillGroups />
      </section>

      <div className="card-actions">
        <button type="button" className="btn btn-primary" onClick={() => ctx.openApp('projects')}>See projects</button>
        <button type="button" className="btn" onClick={() => ctx.openApp('resume')}>Resume</button>
        <button type="button" className="btn" onClick={() => ctx.openApp('contact')}>Contact</button>
      </div>
    </div>
  );
}