import { createPortal } from 'react-dom';
import { Download, FileText, Printer } from 'lucide-react';
import { featuredProjects, resume, site, type ResumeEntry } from '../../data/config';
import { getContactLinks } from '../../data/links';
import { resolveAsset } from '../../lib/format';
import { ExtLink } from '../ui/ExtLink';
import { SetupNote } from '../ui/SetupNote';
import { SkillGroups } from './SkillGroups';

const realProjects = () => featuredProjects.filter((p) => p.featured && !p.placeholder);

export function Resume() {
  const pdf = resume.pdfPath ? resolveAsset(resume.pdfPath) : null;
  const hasContent =
    Boolean(resume.summary) ||
    resume.experience.length > 0 ||
    resume.education.length > 0 ||
    resume.certifications.length > 0 ||
    realProjects().length > 0;

  return (
    <div className="app resume">
      <div className="resume-file">
        <p className="file-chip">
          <FileText size={18} aria-hidden="true" />
          <span className="mono">resume</span>
        </p>
        {(hasContent || pdf) && (
          <div className="card-actions">
            {hasContent && (
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={15} aria-hidden="true" /> Print or save as PDF
              </button>
            )}
            {pdf && (
              <>
                <ExtLink className="btn" href={pdf}>Open PDF</ExtLink>
                <a className="btn" href={pdf} download>
                  <Download size={15} aria-hidden="true" /> Download
                </a>
              </>
            )}
          </div>
        )}
        {resume.lastUpdated && <p className="mono small muted">last updated {resume.lastUpdated}</p>}
      </div>

      {!hasContent && (
        <SetupNote>
          Fill in <code>resume.summary</code>, <code>resume.experience</code> and <code>resume.education</code> in{' '}
          <code>src/data/config.ts</code> to build your resume here.
        </SetupNote>
      )}
      <ResumeBody />

      {hasContent && createPortal(<ResumePrint />, document.body)}
    </div>
  );
}

function ResumeBody() {
  const projects = realProjects();
  return (
    <>
      {resume.summary && (
        <section>
          <h3>summary</h3>
          <p>{resume.summary}</p>
        </section>
      )}
      <ResumeSection title="experience" entries={resume.experience} />
      <ResumeSection title="education" entries={resume.education} />
      {projects.length > 0 && (
        <section>
          <h3>projects</h3>
          <ol className="timeline">
            {projects.map((p) => (
              <li key={p.id}>
                <h4>{p.name}</h4>
                {p.technologies.length > 0 && <p className="timeline-org">{p.technologies.join(' · ')}</p>}
                <p>{p.shortDescription}</p>
                {p.personalContribution && <p>{p.personalContribution}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {resume.certifications.length > 0 && (
        <section>
          <h3>certifications</h3>
          <ul className="bullets">
            {resume.certifications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3>skills</h3>
        <SkillGroups />
      </section>
    </>
  );
}

/** A plain copy of the resume that only appears when printing. */
function ResumePrint() {
  const contacts = getContactLinks().map((l) => l.display);
  return (
    <div className="print-root" aria-hidden="true">
      <header className="print-head">
        <h1>{site.fullName ?? site.handle}</h1>
        {site.role && <p>{site.role}</p>}
        {contacts.length > 0 && <p className="print-contact">{contacts.join(' · ')}</p>}
      </header>
      <div className="print-body">
        <ResumeBody />
      </div>
    </div>
  );
}

function ResumeSection({ title, entries }: { title: string; entries: ResumeEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section>
      <h3>{title}</h3>
      <ol className="timeline">
        {entries.map((e, i) => (
          <li key={`${e.title}-${i}`}>
            <h4>{e.title}</h4>
            <p className="timeline-org">
              {e.organization}
              {e.period ? ` · ${e.period}` : ''}
            </p>
            {e.points && e.points.length > 0 && (
              <ul className="bullets">
                {e.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}