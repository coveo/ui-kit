/**
 * A2-UI Surface Bridge
 *
 * This module bridges between the v1.0 A2-UI surface format (used by the mock API
 * and the real backend) and the v0.9 format consumed by `@copilotkit/a2ui-renderer`.
 *
 * ## Why the conversion exists
 *
 * Agent Gateway emits A2-UI v1.0 exclusively: a single `createSurface` carrying its
 * `components[]` inline. Every renderer available to us is v0.9 —
 * `@copilotkit/a2ui-renderer`'s React path builds its `MessageProcessor` from
 * `@a2ui/web_core/v0_9`, and `@a2ui/web_core@0.9.0` publishes no `v1_0` subpath. So a
 * downgrade has to happen somewhere on the client, and today it happens here.
 *
 * ## What is load-bearing, and what is not
 *
 * Exactly one transformation makes rendering work: **splitting v1.0's single
 * `createSurface` into `createSurface` + `updateComponents`**. Inline `components` are a
 * v1.0 addition — the spec's evolution guide describes v1.0 as allowing "the creation of
 * entire UIs in a single message, rather than a create followed by separate updates"
 * (https://a2ui.org/specification/v1.0-evolution-guide/). v0.9 is that earlier
 * create-then-update shape: its `CreateSurfaceMessageSchema` is `.strict()` with no
 * `components` property, and `processCreateSurfaceMessage` destructures only
 * `{ surfaceId, catalogId, theme, sendDataModel }`, so inline nodes are silently discarded
 * unless re-delivered under a separate `updateComponents`. The split reverses exactly the
 * change v1.0 introduced.
 *
 * The `version` string rewriting is **not** what makes the renderer work: `processMessage`
 * dispatches purely on which operation key is present, never reads `version`, and stamps
 * `version: 'v0.9'` onto its own normalized output regardless of what arrived. It is still
 * emitted rather than dropped, for two reasons: the v0.9 schema declares
 * `version: z.literal('v0.9')`, and the spec directs renderers to inspect `version` to
 * "route payloads to version-specific controllers" — this processor simply does not,
 * because its subpath already fixed the version at import time.
 *
 * Everything else is pass-through. Under the flat A2-UI v1.0 node model a node carries a
 * single `id`/`component` identity plus its presentation values, A2-UI Data_Binding objects
 * (`{ "path": <JSON Pointer> }`), and composition links directly at the top level — there is
 * no `props` wrapper, which is already the shape the v0.9 renderer mounts. So nodes are
 * forwarded byte-for-byte, `updateDataModel` ops pass through for the renderer to apply to
 * its own data model, and a message carrying no recognized operation is dropped rather than
 * forwarded, so a malformed message can never corrupt a surface.
 *
 * ## When the renderer supports v1.0
 *
 * The removal trigger is specific: `@a2ui/web_core` publishes a `./v1_0` subpath (or its
 * `v0_9` `MessageProcessor` learns to read inline `components[]`) **and**
 * `@copilotkit/a2ui-renderer` imports it. Neither is true today. Once both are:
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
 * - `createSurface` (v1.0) → `createSurface` + `updateComponents` (v0.9). This split is the
 *   only load-bearing part of the conversion: the v0.9 `processCreateSurfaceMessage` reads
 *   only `{ surfaceId, catalogId, theme, sendDataModel }`, so inline `components[]` must be
 *   re-delivered under a separate `updateComponents` or they are silently dropped.
 *   v1.0 nodes are already FLAT (each node carries its presentation values, `{ "path": ... }`
 *   Data_Binding objects, and composition links directly at the top level — there is no
 *   `props` wrapper) AND already mount the canonical `root` node (id: "root"), which is exactly
 *   the shape the v0.9 renderer expects. Nodes are therefore forwarded as-is, preserving the
 *   single `id`/`component` identity byte-for-byte (no `componentId`/`componentType` is ever
 *   introduced). The v1.0 envelope carries no `rootId`, so no root remap is performed.
 * - `updateDataModel` passes through carrying its `{ surfaceId, path, value }` unchanged;
 *   the renderer applies it to its data model
 * - `updateComponents` / `deleteSurface` → same shape
 * - a v1.0 message carrying no recognized operation is unconvertible and is REJECTED
 *   (dropped), so it never reaches the renderer and cannot mutate its state
 *
 * The emitted `version: 'v0.9'` is not what makes the renderer work — `processMessage`
 * dispatches on the operation key alone and stamps its own version — but it is what the v0.9
 * schema declares and what the spec tells renderers to route on, so it is emitted, not dropped.
 *
 * @deprecated Remove when a v1.0-capable renderer is available; see the module doc for the
 * precise removal trigger.
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

/**
 * Extracts A2-UI messages from activities, converting v1.0 to v0.9 for the renderer.
 *
 * Surface-bearing activities carry their A2-UI sequence under `payload.messages`. Messages that
 * do not declare `version: 'v1.0'` are forwarded verbatim by {@link convertV1ToV09}, so an
 * already-v0.9 stream needs no special handling here.
 */
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
