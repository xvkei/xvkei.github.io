const SESSION_KEY = 'haya.booted';
const REBOOT_EVENT = 'haya:reboot';

/** Boot once per browser session, but never for deep links or reduced-motion visitors. */
export function shouldBoot(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.location.hash.length > 1) return false; // came for something specific, e.g. #/resume
    return sessionStorage.getItem(SESSION_KEY) !== '1';
  } catch {
    return false;
  }
}

export function markBooted() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* storage blocked: it'll just boot again next load */
  }
}

export function requestReboot() {
  window.dispatchEvent(new Event(REBOOT_EVENT));
}

export function onReboot(callback: () => void) {
  window.addEventListener(REBOOT_EVENT, callback);
  return () => window.removeEventListener(REBOOT_EVENT, callback);
}