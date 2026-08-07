import {useEffect, useMemo, useRef} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {Activity} from '@coveo/thermidor';

type A2UIMessage = Record<string, unknown>;

/** Extracts opaque A2-UI messages without translating their protocol payloads. */
export function getA2UIMessages(activities: Activity[]): A2UIMessage[] {
  const messages: A2UIMessage[] = [];

  for (const activity of activities) {
    if (activity.kind !== 'a2ui-surface' || !isRecord(activity.payload)) {
      continue;
    }
    const operations = activity.payload['a2ui_operations'];
    if (!Array.isArray(operations)) {
      continue;
    }
    if (activity.replace) {
      messages.length = 0;
    }
    messages.push(...operations.filter(isRecord));
  }

  return messages;
}

export function ThermidorA2UISurfaces({messages}: {messages: A2UIMessage[]}) {
  const {clearSurfaces, processMessages} = useA2UI();
  const serializedMessages = useMemo(() => JSON.stringify(messages), [messages]);
  const surfaceIds = useMemo(() => getSurfaceIds(messages), [messages]);
  const actionsRef = useRef({clearSurfaces, processMessages});
  actionsRef.current = {clearSurfaces, processMessages};

  useEffect(() => {
    const {clearSurfaces, processMessages} = actionsRef.current;
    clearSurfaces();
    if (serializedMessages !== '[]') {
      processMessages(JSON.parse(serializedMessages) as A2UIMessage[]);
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

function getSurfaceIds(messages: A2UIMessage[]): string[] {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
