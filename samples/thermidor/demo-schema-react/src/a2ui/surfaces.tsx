/**
 * A2-UI Surface Bridge
 *
 * Mounts the session's A2-UI message stream into the renderer, and draws each surface where the
 * page places it.
 *
 * The v1.0 → v0.9 downgrade the renderer needs no longer happens here: it is a derived
 * projection inside `@coveo/thermidor`, read off `response.a2uiMessages`. See that package's
 * `session/a2ui-v09-projection.ts` for the conversion and the recorded interim debt.
 */
import {useEffect, useMemo, useRef} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {A2uiV09Message} from '@coveo/thermidor';
import {SurfaceReadOnlyProvider} from './surface-read-only.js';
import styles from './surfaces.module.css';

/**
 * Feeds the whole session's message stream to the renderer. It draws nothing itself: each
 * surface is drawn by a {@link TurnSurfaces} placed under the turn that created it.
 */
export function ThermidorA2UIStream({messages}: {messages: A2uiV09Message[]}) {
  const {clearSurfaces, processMessages} = useA2UI();
  const serializedMessages = useMemo(() => JSON.stringify(messages), [messages]);
  const actionsRef = useRef({clearSurfaces, processMessages});
  actionsRef.current = {clearSurfaces, processMessages};

  useEffect(() => {
    const {clearSurfaces, processMessages} = actionsRef.current;
    clearSurfaces();
    if (serializedMessages !== '[]') {
      processMessages(JSON.parse(serializedMessages) as A2uiV09Message[]);
    }
  }, [serializedMessages]);

  return null;
}

interface TurnSurfacesProps {
  surfaceIds: readonly string[];
  /**
   * Whether the shopper can act on these surfaces. The session only sends actions for the
   * surfaces of its active turn, so the controls of earlier turns' blocks are disabled while
   * their content stays readable.
   */
  interactive: boolean;
}

/**
 * Draws one turn's surfaces in order. A surface added to an already drawn turn, such as the
 * search block a search option opens, is scrolled into view.
 */
export function TurnSurfaces({surfaceIds, interactive}: TurnSurfacesProps) {
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const drawnIdsRef = useRef<ReadonlySet<string> | null>(null);

  useEffect(() => {
    const drawnIds = drawnIdsRef.current;
    drawnIdsRef.current = new Set(surfaceIds);
    if (drawnIds === null) {
      return;
    }
    const added = surfaceIds.find((surfaceId) => !drawnIds.has(surfaceId));
    if (added !== undefined) {
      sectionRefs.current.get(added)?.scrollIntoView?.({behavior: 'smooth', block: 'start'});
    }
  }, [surfaceIds]);

  if (surfaceIds.length === 0) {
    return null;
  }

  return (
    <SurfaceReadOnlyProvider value={!interactive}>
      <div className={interactive ? undefined : styles.readOnly}>
        {!interactive && (
          <p className={styles.readOnlyNote}>
            Earlier results. Ask a follow-up or search again to refine.
          </p>
        )}
        {surfaceIds.map((surfaceId) => (
          <section
            className="catalog-surface"
            aria-label={`A2-UI surface ${surfaceId}`}
            key={surfaceId}
            ref={(element) => {
              if (element) {
                sectionRefs.current.set(surfaceId, element);
              } else {
                sectionRefs.current.delete(surfaceId);
              }
            }}
          >
            <A2UIRenderer surfaceId={surfaceId} />
          </section>
        ))}
      </div>
    </SurfaceReadOnlyProvider>
  );
}
