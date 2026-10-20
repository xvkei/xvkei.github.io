import type { AppCtx } from '../../app/apps';
import { site } from '../../data/config';

export function Readme({ ctx }: { ctx: AppCtx }) {
  const desktop = ctx.mode === 'desktop';
  return (
    <div className="app readme">
      <p className="mono small muted">README_first.txt — plain text, no surprises</p>
      <p className="readme-lead">hi! this is {site.handle}'s portfolio, arranged like a small personal computer.</p>

      <section>
        <h3>getting around</h3>
        <ul className="bullets">
          {desktop ? (
            <>
              <li>Click any desktop icon to open it. The start menu (bottom left) lists everything too.</li>
              <li>Drag windows by their title bar. Double-click a title bar, or use the square button, to maximize.</li>
              <li>Minimized windows wait in the taskbar — click one to bring it back.</li>
              <li>Keyboard: Tab moves through icons, windows and the taskbar; Escape closes the start menu.</li>
            </>
          ) : (
            <>
              <li>Tap an app to open it full screen. The back button in the top bar returns home.</li>
              <li>The dock at the bottom jumps straight to projects, repositories, about and contact.</li>
            </>
          )}
          <li>The terminal is optional — type <code>help</code> if you're curious. Nothing here requires it.</li>
        </ul>
      </section>

      <section>
        <h3>quick links</h3>
        <div className="card-actions">
          <button type="button" className="btn btn-primary" onClick={() => ctx.openApp('projects')}>Featured projects</button>
          <button type="button" className="btn" onClick={() => ctx.openApp('archive')}>All repositories</button>
          <button type="button" className="btn" onClick={() => ctx.openApp('resume')}>Resume</button>
          <button type="button" className="btn" onClick={() => ctx.openApp('contact')}>Contact</button>
        </div>
      </section>
    </div>
  );
}