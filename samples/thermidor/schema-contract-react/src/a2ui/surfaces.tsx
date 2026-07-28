import {useEffect, useMemo, useState} from 'react';
import {A2uiSurface, type ReactComponentImplementation} from '@a2ui/react/v0_9';
import {
  type A2uiMessage,
  type Catalog,
  MessageProcessor,
  type SurfaceModel,
} from '@a2ui/web_core/v0_9';
import type {Activity} from '@coveo/thermidor';

type OpaqueA2UIMessage = Record<string, unknown>;

/** Extracts opaque A2-UI messages without translating their protocol payloads. */
export function getA2UIMessages(activities: Activity[]): OpaqueA2UIMessage[] {
  const messages: OpaqueA2UIMessage[] = [];

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

export function ThermidorA2UISurfaces({
  catalog,
  messages,
}: {
  catalog: Catalog<ReactComponentImplementation>;
  messages: OpaqueA2UIMessage[];
}) {
  const serializedMessages = useMemo(() => JSON.stringify(messages), [messages]);
  const processor = useMemo(() => new MessageProcessor([catalog]), [catalog]);
  const [surfaces, setSurfaces] = useState<SurfaceModel<ReactComponentImplementation>[]>([]);

  useEffect(() => {
    const updateSurfaces = () => setSurfaces([...processor.model.surfacesMap.values()]);
    const createdSubscription = processor.onSurfaceCreated(updateSurfaces);
    const deletedSubscription = processor.onSurfaceDeleted(updateSurfaces);

    for (const surfaceId of processor.model.surfacesMap.keys()) {
      processor.model.deleteSurface(surfaceId);
    }
    if (serializedMessages !== '[]') {
      processor.processMessages(JSON.parse(serializedMessages) as A2uiMessage[]);
    }
    updateSurfaces();

    return () => {
      createdSubscription.unsubscribe();
      deletedSubscription.unsubscribe();
    };
  }, [processor, serializedMessages]);

  return (
    <>
      {surfaces.map((surface) => (
        <section
          className="catalog-surface"
          aria-label={`A2-UI surface ${surface.id}`}
          key={surface.id}
        >
          <A2uiSurface surface={surface} />
        </section>
      ))}
    </>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
