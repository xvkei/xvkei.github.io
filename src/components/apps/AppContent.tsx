import { memo } from 'react';
import type { AppCtx, AppId } from '../../app/apps';
import { FeaturedProjects } from '../projects/FeaturedProjects';
import { ProjectDetail } from '../projects/ProjectDetail';
import { RepoArchive } from '../projects/RepoArchive';
import { About } from './About';
import { Contact } from './Contact';
import { Notes } from './Notes';
import { NowPlaying } from './NowPlaying';
import { Readme } from './Readme';
import { Resume } from './Resume';
import { Terminal } from './Terminal';
import { Arcade } from './arcade/Arcade';
import { Settings } from './Settings';
import { Guestbook } from './Guestbook';

/** Memoised so dragging/focusing windows never re-renders their contents. */
export const AppContent = memo(function AppContent({ id, ctx }: { id: AppId; ctx: AppCtx }) {
  switch (id) {
    case 'projects':
      return <FeaturedProjects ctx={ctx} />;
    case 'archive':
      return <RepoArchive ctx={ctx} />;
    case 'project':
      return <ProjectDetail ctx={ctx} />;
    case 'about':
      return <About ctx={ctx} />;
    case 'resume':
      return <Resume />;
    case 'contact':
      return <Contact />;
    case 'guestbook':
      return <Guestbook />;
    case 'music':
      return <NowPlaying />;
    case 'notes':
      return <Notes />;
    case 'arcade':
      return <Arcade />;
    case 'settings':
      return <Settings />;
    case 'terminal':
      return <Terminal ctx={ctx} />;
    case 'readme':
      return <Readme ctx={ctx} />;
  }
});