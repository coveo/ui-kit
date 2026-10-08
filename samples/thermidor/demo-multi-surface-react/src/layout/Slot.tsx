import {A2UIRenderer} from '@copilotkit/a2ui-renderer';
import type {PlacedSurface} from './surface-layout.js';

interface SlotProps {
  name: string;
  surfaces: readonly PlacedSurface[];
  className?: string;
}

/** Draws the surfaces the server placed in one layout slot, in creation order. */
export function Slot({name, surfaces, className}: SlotProps) {
  if (surfaces.length === 0) {
    return null;
  }
  return (
    <div className={className} data-slot={name}>
      {surfaces.map((surface) => (
        <section
          key={surface.surfaceId}
          className="catalog-surface"
          aria-label={`A2-UI surface ${surface.surfaceId}`}
          data-surface-id={surface.surfaceId}
        >
          <A2UIRenderer surfaceId={surface.surfaceId} />
        </section>
      ))}
    </div>
  );
}
