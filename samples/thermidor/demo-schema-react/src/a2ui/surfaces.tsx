/**
 * A2-UI Surface Bridge
 *
 * Bridges the v1.0 A2-UI surface format (mock API + real backend) to the v0.9
 * format `@copilotkit/a2ui-renderer` consumes. The backend emits a v1.0
 * `createSurface` with inline flat `components[]`; the renderer expects v0.9
 * (`createSurface` + a separate `updateComponents`). `convertV1ToV09` translates
 * each message, forwarding flat nodes as-is (bindings byte-for-byte) and passing
 * `updateDataModel` ops through; unconvertible messages are dropped.
 *
 * @deprecated Remove the conversion once the renderer understands v1.0 natively.
 */
import {useEffect, useMemo, useRef} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {Activity} from '@coveo/thermidor';
import {isRecord} from '../utils.js';

type A2UIMessage = Record<string, unknown>;

/**
 * Converts a single v1.0 A2-UI message into one or more v0.9 messages for the
 * renderer's MessageProcessor:
 * - `createSurface` -> `createSurface` + `updateComponents` (flat nodes forwarded
 *   as-is, bindings preserved byte-for-byte)
 * - `updateDataModel` / `updateComponents` / `deleteSurface` -> same shape, v0.9
 * - a message with no recognized operation is dropped (never reaches the renderer)
 *
 * @deprecated Remove when @copilotkit/a2ui-renderer supports v1.0 natively.
 */
export function convertV1ToV09(message: Record<string, unknown>): A2UIMessage[] {
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
      // v1.0 nodes are already flat and mount the canonical `root` — the exact
      // shape the v0.9 renderer expects, so forward them as-is (no `rootId` remap).
      results.push({version: 'v0.9', updateComponents: {surfaceId, components}});
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

  // An unconvertible v1.0 message is dropped (never reaches the renderer); the
  // drop is reported as a dev-only warning.
  if (import.meta.env?.DEV) {
    console.warn('[A2UI bridge] Dropped unconvertible v1.0 message', message);
  }
  return [];
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
