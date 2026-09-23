/**
 * A2-UI Surface Bridge
 *
 * This module bridges between the v1.0 A2-UI surface format (used by the mock API
 * and the real backend) and the v0.9 format consumed by `@copilotkit/a2ui-renderer`.
 *
 * ## Why the conversion exists
 *
 * The backend emits v1.0 messages: a single `createSurface` carrying its `components[]` inline.
 * `@copilotkit/a2ui-renderer` (v1.61) only understands v0.9 messages (`createSurface` for the
 * surface lifecycle + a separate `updateComponents` carrying the component nodes).
 *
 * The `convertV1ToV09` adapter translates each v1.0 message into the equivalent v0.9
 * messages so the MessageProcessor can create surfaces and resolve catalog renderers.
 *
 * ## What the conversion preserves
 *
 * Under the flat A2-UI v1.0 node model a node carries a single `id`/`component` identity plus its
 * presentation values, A2-UI Data_Binding objects (`{ "path": <JSON Pointer> }`), and composition
 * links directly at the top level — there is no `props` wrapper, which is already the shape the
 * v0.9 renderer mounts. The conversion:
 *
 * - forwards each flat node as-is (only remapping the declared root id to `"root"`), carrying every
 *   `{ "path": ... }` binding through byte-for-byte so the binder can resolve it against the A2-UI
 *   data model, and never synthesizing an identity correlation (`componentId`/`componentType`);
 * - passes `updateDataModel` ops through unchanged (only the version is bumped to v0.9), so
 *   the renderer applies each `{ surfaceId, path, value }` op to its own data model and
 *   re-resolves the affected `{ path }` bindings;
 * - rejects any message it cannot convert by leaving it out of the v0.9 stream (renderer
 *   state stays unchanged) so a malformed message never corrupts a surface.
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
 * 3. Verify that `processMessages` handles `createSurface` with inline flat `components[]`
 *    and resolves each node's `{ path }` bindings against the data model correctly
 * 4. Everything else (dumb renderers, catalog definitions) stays unchanged
 */
import {useEffect, useMemo, useRef} from 'react';
import {A2UIRenderer, useA2UI} from '@copilotkit/a2ui-renderer';
import type {Activity} from '@coveo/thermidor';
import {isRecord} from '../utils.js';

type A2UIMessage = Record<string, unknown>;

/**
 * Converts a single v1.0 A2-UI message into one or more v0.9 messages
 * that the @copilotkit/a2ui-renderer MessageProcessor can understand.
 *
 * Conversion rules:
 * - `createSurface` (v1.0) → `createSurface` + `updateComponents` (v0.9)
 *   - v1.0 nodes are already FLAT (each node carries its presentation values, `{ "path": ... }`
 *     Data_Binding objects, and composition links directly at the top level — there is no
 *     `props` wrapper) AND already mount the canonical `root` node (id: "root"), which is exactly
 *     the shape the v0.9 renderer expects. Nodes are therefore forwarded as-is, preserving the
 *     single `id`/`component` identity byte-for-byte (no `componentId`/`componentType` is ever
 *     introduced). The v1.0 envelope carries no `rootId`, so no root remap is performed.
 * - `updateDataModel` passes through carrying its `{ surfaceId, path, value }` unchanged
 *   (only the version is bumped to v0.9); the renderer applies it to its data model
 * - `updateComponents` / `deleteSurface` → same shape, version changed to v0.9
 * - a v1.0 message carrying no recognized operation is unconvertible and is REJECTED
 *   (dropped), so it never reaches the renderer and cannot mutate its state
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
      // A2-UI v1.0 nodes are already flat AND already mount the canonical `root` node (id: "root"),
      // which is exactly what the v0.9 renderer expects — so each node is forwarded as-is. No
      // `rootId` remap is needed (the v1.0 envelope carries no `rootId`).
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

  // A v1.0 message carrying no recognized operation is unconvertible: it is REJECTED
  // (dropped from the v0.9 stream) so it can never mutate the renderer's state. The failure
  // is reported as a dev-only warning; the previously rendered UI stays displayed.
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
