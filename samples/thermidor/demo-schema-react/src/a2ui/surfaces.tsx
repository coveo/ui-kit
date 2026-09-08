/**
 * A2-UI Surface Bridge
 *
 * This module bridges between the v1.0 A2-UI surface format (used by the mock API
 * and the real backend) and the v0.9 format consumed by `@copilotkit/a2ui-renderer`.
 *
 * ## Why the conversion exists
 *
 * The backend emits v1.0 messages (`createSurface` with inline `components[].props`),
 * but `@copilotkit/a2ui-renderer` (v1.61) only understands v0.9 messages
 * (`createSurface` + separate `updateComponents` with props flattened on component nodes).
 *
 * The `convertV1ToV09` adapter translates each v1.0 message into the equivalent v0.9
 * messages so the MessageProcessor can create surfaces and resolve catalog renderers.
 *
 * ## When @copilotkit/a2ui-renderer supports v1.0
 *
 * Once the renderer natively understands v1.0, remove the conversion:
 *
 * 1. Delete the `convertV1ToV09` function
 * 2. In `getA2UIMessages`, pass v1.0 messages directly (remove the conversion loop):
 *    ```
 *    converted.push(...v1Messages.filter(isRecord));
 *    ```
 * 3. Verify that `processMessages` handles `createSurface` with `components[].props`
 *    and passes `props` (including `componentId` and `componentType`) to catalog renderers correctly
 * 4. Everything else (renderers, catalog definitions, useRemoteController) stays unchanged
 */
import {useEffect, useMemo, useRef} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {Activity} from '@coveo/thermidor';

type A2UIMessage = Record<string, unknown>;

/**
 * Converts a single v1.0 A2-UI message into one or more v0.9 messages
 * that the @copilotkit/a2ui-renderer MessageProcessor can understand.
 *
 * Conversion rules:
 * - `createSurface` (v1.0) → `createSurface` + `updateComponents` (v0.9)
 *   - `components[].props` are flattened onto the component node directly
 * - `updateDataModel` / `updateComponents` / `deleteSurface` → same shape, version changed to v0.9
 *
 * @deprecated Remove when @copilotkit/a2ui-renderer supports v1.0 natively.
 */
function convertV1ToV09(message: Record<string, unknown>): A2UIMessage[] {
  if (message['version'] !== 'v1.0') {
    return [message];
  }

  const createSurface = message['createSurface'];
  if (isRecord(createSurface)) {
    const surfaceId = createSurface['surfaceId'] as string;
    const catalogId = createSurface['catalogId'] as string | undefined;
    const components = createSurface['components'] as Array<Record<string, unknown>> | undefined;

    const results: A2UIMessage[] = [
      {version: 'v0.9', createSurface: {surfaceId, ...(catalogId ? {catalogId} : {})}},
    ];

    if (components && components.length > 0) {
      const v09Components = components.map((comp) => {
        const {props, ...rest} = comp;
        if (isRecord(props)) {
          return {...rest, ...props};
        }
        return rest;
      });
      results.push({version: 'v0.9', updateComponents: {surfaceId, components: v09Components}});
    }

    return results;
  }

  const updateDataModel = message['updateDataModel'];
  if (isRecord(updateDataModel)) {
    return [{version: 'v0.9', updateDataModel}];
  }

  const updateComponents = message['updateComponents'];
  if (isRecord(updateComponents)) {
    return [{version: 'v0.9', updateComponents}];
  }

  const deleteSurface = message['deleteSurface'];
  if (isRecord(deleteSurface)) {
    return [{version: 'v0.9', deleteSurface}];
  }

  return [message];
}

/** Extracts A2-UI messages from activities, converting v1.0 to v0.9 for the renderer. */
export function getA2UIMessages(activities: Activity[] | undefined): A2UIMessage[] {
  if (!activities) {
    return [];
  }

  // Track messages per activity ID to support replace semantics
  const messagesByActivityId = new Map<string, A2UIMessage[]>();
  const activityOrder: string[] = [];

  for (const activity of activities) {
    if (activity.kind !== 'a2ui-surface' || !isRecord(activity.payload)) {
      continue;
    }

    const activityId = activity.id;

    // v0.9 format: a2ui_operations array (pass through as-is)
    const operations = activity.payload['a2ui_operations'];
    if (Array.isArray(operations)) {
      if (activity.replace) {
        messagesByActivityId.set(activityId, operations.filter(isRecord));
      } else {
        const existing = messagesByActivityId.get(activityId) ?? [];
        existing.push(...operations.filter(isRecord));
        messagesByActivityId.set(activityId, existing);
      }
      if (!activityOrder.includes(activityId)) {
        activityOrder.push(activityId);
      }
      continue;
    }

    // v1.0 format: messages array — convert to v0.9 before passing to renderer
    const v1Messages = activity.payload['messages'];
    if (Array.isArray(v1Messages)) {
      const converted: A2UIMessage[] = [];
      for (const msg of v1Messages) {
        if (isRecord(msg)) {
          converted.push(...convertV1ToV09(msg));
        }
      }
      if (activity.replace) {
        messagesByActivityId.set(activityId, converted);
      } else {
        const existing = messagesByActivityId.get(activityId) ?? [];
        existing.push(...converted);
        messagesByActivityId.set(activityId, existing);
      }
      if (!activityOrder.includes(activityId)) {
        activityOrder.push(activityId);
      }
      continue;
    }
  }

  // Flatten in order of first appearance
  const result: A2UIMessage[] = [];
  for (const id of activityOrder) {
    const msgs = messagesByActivityId.get(id);
    if (msgs) {
      result.push(...msgs);
    }
  }
  return result;
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
