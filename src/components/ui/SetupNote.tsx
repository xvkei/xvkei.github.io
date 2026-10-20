import type { ReactNode } from 'react';

export function SetupNote({ children }: { children: ReactNode }) {
  return (
    <div className="setup-note" role="note">
      <span className="setup-note-label">setup placeholder</span>
      <p>{children}</p>
    </div>
  );
}