/**
 * A2-UI Surface Bridge
 *
 * Mounts the A2-UI message stream carried by a turn into the renderer.
 *
 * The v1.0 → v0.9 downgrade the renderer needs no longer happens here: it is a derived
 * projection inside `@coveo/thermidor`, read off `response.a2uiMessages`. See that package's
 * `session/a2ui-v09-projection.ts` for the conversion and the recorded interim debt.
 */
import {useEffect, useMemo, useRef} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {A2uiV09Message} from '@coveo/thermidor';
import {isRecord} from '../utils.js';

export function ThermidorA2UISurfaces({messages}: {messages: A2uiV09Message[]}) {
  const {clearSurfaces, processMessages} = useA2UI();
  const serializedMessages = useMemo(() => JSON.stringify(messages), [messages]);
  const surfaceIds = useMemo(() => getSurfaceIds(messages), [messages]);
  const actionsRef = useRef({clearSurfaces, processMessages});
  actionsRef.current = {clearSurfaces, processMessages};

  useEffect(() => {
    const {clearSurfaces, processMessages} = actionsRef.current;
    clearSurfaces();
    if (serializedMessages !== '[]') {
      processMessages(JSON.parse(serializedMessages) as A2uiV09Message[]);
    }
  }, [serializedMessages]);

  return (
    <>
      {surfaceIds.map((surfaceId) => (
        <section
          className="catalog-surface"
          aria-label={`A2-UI surface ${surfaceId}`}
          key={surfaceId}
        >
          <A2UIRenderer surfaceId={surfaceId} />
        </section>
      ))}
    </>
  );
}

function getSurfaceIds(messages: A2uiV09Message[]): string[] {
  const surfaceIds = new Set<string>();
  for (const message of messages) {
    const createSurface = message['createSurface'];
    if (isRecord(createSurface) && typeof createSurface['surfaceId'] === 'string') {
      surfaceIds.add(createSurface['surfaceId']);
      continue;
    }
    const deleteSurface = message['deleteSurface'];
    if (isRecord(deleteSurface) && typeof deleteSurface['surfaceId'] === 'string') {
      surfaceIds.delete(deleteSurface['surfaceId']);
    }
  }
  return [...surfaceIds];
}
