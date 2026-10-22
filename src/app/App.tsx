import { useCallback, useEffect, useRef, useState } from 'react';
import { BootScreen } from '../components/boot/BootScreen';
import { DesktopShell } from '../components/desktop/DesktopShell';
import { MobileShell } from '../components/mobile/MobileShell';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { markBooted, onReboot, shouldBoot } from '../lib/boot';
import { DESKTOP_QUERY } from './apps';

export default function App() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [booting, setBooting] = useState(shouldBoot);
  const [shellKey, setShellKey] = useState(0);
  const shellRef = useRef<HTMLDivElement>(null);

  // "reboot" from the terminal: fresh desktop + boot screen
  useEffect(
    () =>
      onReboot(() => {
        setShellKey((k) => k + 1);
        setBooting(true);
      }),
    [],
  );

  // keep the desktop out of reach (keyboard, screen readers) until boot finishes
  useEffect(() => {
    shellRef.current?.toggleAttribute('inert', booting);
  }, [booting, shellKey]);

  const finishBoot = useCallback(() => {
    markBooted();
    setBooting(false);
  }, []);

  return (
    <>
      <div ref={shellRef} key={shellKey}>
        {isDesktop ? <DesktopShell /> : <MobileShell />}
      </div>
      {booting && <BootScreen onDone={finishBoot} />}
    </>
  );
}