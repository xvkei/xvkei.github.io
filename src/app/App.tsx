import { DesktopShell } from '../components/desktop/DesktopShell';
import { MobileShell } from '../components/mobile/MobileShell';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { DESKTOP_QUERY } from './apps';

export default function App() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return isDesktop ? <DesktopShell /> : <MobileShell />;
}