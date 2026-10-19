import {A2UIRenderer} from '@copilotkit/a2ui-renderer';
import {A2UISkeleton} from '../../../demo-schema-react/src/a2ui/Skeleton/Skeleton.js';
import styles from './SurfaceList.module.css';

interface SurfaceListProps {
  /** Render surface ids, in the order to draw them. */
  surfaceIds: readonly string[];
  /** The root component type of each surface that is a loading placeholder. */
  loadingSurfaces: ReadonlyMap<string, string>;
  /** Whether the turn that owns these surfaces is streaming; a placeholder is drawn only then. */
  isStreaming: boolean;
  className?: string;
}

/** Draws a view's surfaces in order, a loading placeholder as its component's skeleton. */
export function SurfaceList({
  surfaceIds,
  loadingSurfaces,
  isStreaming,
  className,
}: SurfaceListProps) {
  const drawn = isStreaming
    ? surfaceIds
    : surfaceIds.filter((surfaceId) => !loadingSurfaces.has(surfaceId));
  if (drawn.length === 0) {
    return null;
  }
  return (
    <div className={className ?? styles.surfaces}>
      {drawn.map((surfaceId) => {
        const loadingComponentType = loadingSurfaces.get(surfaceId);
        return (
          <section
            key={surfaceId}
            className="catalog-surface"
            aria-label={`A2-UI surface ${surfaceId}`}
            data-surface-id={surfaceId}
          >
            {loadingComponentType !== undefined ? (
              <A2UISkeleton componentType={loadingComponentType} />
            ) : (
              <A2UIRenderer surfaceId={surfaceId} />
            )}
          </section>
        );
      })}
    </div>
  );
}
