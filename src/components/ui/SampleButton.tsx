import { useId, useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import type { ProjectImage } from '../../data/config';
import { resolveAsset } from '../../lib/format';

/** A "View sample" button that opens a project's image large, in a modal dialog. */
export function SampleButton({ image, projectName, className = 'btn' }: { image: ProjectImage; projectName: string; className?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className={className} aria-haspopup="dialog" onClick={() => dialogRef.current?.showModal()}>
        <ImageIcon size={15} aria-hidden="true" /> View sample<span className="sr-only"> of {projectName}</span>
      </button>

      <dialog
        ref={dialogRef}
        className="sample-dialog"
        aria-labelledby={titleId}
        // a click on the dimmed backdrop lands on the dialog itself: close it
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        // keep Escape from also closing the start menu or a mobile panel behind it
        onKeyDown={(e) => {
          if (e.key === 'Escape') e.stopPropagation();
        }}
      >
        <div className="sample-frame">
          <div className="sample-head">
            <p id={titleId} className="sample-title">{projectName} · sample</p>
            <button type="button" className="sample-close" onClick={close} aria-label="Close sample">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="sample-body">
            <img
              src={resolveAsset(image.src)}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </dialog>
    </>
  );
}