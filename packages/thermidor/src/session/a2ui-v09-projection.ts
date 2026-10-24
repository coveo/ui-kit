/**
 * A2-UI v0.9 renderer projection — RECORDED INTERIM DEBT (ADR-015 addendum).
 *
 * This module is the SINGLE location in the package that rewrites an A2-UI
 * message envelope, and the only place that knows a renderer's wire shape. It
 * exists because the two ends of the protocol are pinned one minor version
 * apart with nothing in between:
 *
 * - Agent Gateway emits A2-UI **v1.0** exclusively — a spec Candidate
 *   (https://a2ui.org/specification/v1.0-a2ui/). `A2uiMessage.VERSION` is
 *   `"v1.0"` and it throws on any other version, on both construct and parse,
 *   and its snapshot/state path is v1.0-only by construction.
 * - Every renderer available to a consumer is **v0.9**, the Current spec
 *   (https://a2ui.org/specification/v0.9.1-a2ui/).
 *   `@copilotkit/a2ui-renderer` builds its `MessageProcessor` from
 *   `@a2ui/web_core/v0_9`, and `@a2ui/web_core@0.9.0` publishes no `v1_0`
 *   subpath. There is, today, zero renderer that consumes v1.0.
 *
 * Something has to bridge that gap. Doing it here — rather than in Gateway, or
 * in each consumer's frontend — is a deliberate choice recorded in the ADR-015
 * addendum: a server breaking change is worse than a package one, Gateway would
 * otherwise emit a shape its own model refuses to parse, and asking every
 * consumer to reimplement this conversion is not a shipping story.
 *
 * ## Charter exception
 *
 * The charter (ADR-009 §4) requires that thermidor "faithfully expose the
 * server's streamed result" and MUST NOT reinterpret it, and §5 prohibits
 * leaking transport DTO shapes through the public API. This module knowingly
 * does both, for a bounded period, in one auditable place. `activities` remain
 * raw v1.0 in the store — this projection is derived, never a source of truth —
 * so nothing downstream of the fold (surface derivation, in-transit
 * `updateDataModel` validation) observes the downgrade.
 *
 * ## What is load-bearing, and what is not
 *
 * Exactly one transformation makes rendering work: **splitting v1.0's single
 * `createSurface` into `createSurface` + `updateComponents`**.
 *
 * This is not an arbitrary reshuffle — it is the exact reversal of the change
 * v1.0 introduced. The spec's evolution guide
 * (https://a2ui.org/specification/v1.0-evolution-guide/) lists, for v0.9.1 → v1.0:
 * "Components and initial data model states can be defined directly within the
 * `createSurface` parameters. This allows for the creation of entire UIs in a
 * single message, rather than a create followed by separate updates." v0.9 is
 * that earlier create-then-update shape: its `CreateSurfaceMessageSchema` is
 * `.strict()` with no `components` property at all, so inline nodes are a schema
 * violation there rather than merely ignored — and at runtime
 * `processCreateSurfaceMessage` destructures only
 * `{ surfaceId, catalogId, theme, sendDataModel }`, silently dropping them.
 *
 * The emitted `version: 'v0.9'` is **not** what makes the renderer work:
 * `processMessage` dispatches purely on which operation key is present, never
 * reads `version`, and stamps its own version onto normalized output regardless
 * of what arrived. It is still emitted rather than dropped, because the v0.9
 * schema declares `version: z.literal('v0.9')` and the spec directs renderers to
 * inspect `version` to "route payloads to version-specific controllers" — this
 * processor simply does not, because its subpath fixed the version at import
 * time.
 *
 * Everything else is pass-through. Under the flat A2-UI v1.0 node model a node
 * carries a single `id`/`component` identity plus its presentation values, A2-UI
 * Data_Binding objects (`{ "path": <JSON Pointer> }`), and composition links
 * directly at the top level — there is no `props` wrapper, which is already the
 * shape the v0.9 renderer mounts. Nodes are forwarded byte-for-byte.
 *
 * ## Removal trigger
 *
 * Remove this module when BOTH hold:
 *
 * 1. `@a2ui/web_core` publishes a `./v1_0` subpath, or its `v0_9`
 *    `MessageProcessor` learns to read inline `components[]`; and
 * 2. `@copilotkit/a2ui-renderer` (or whichever renderer consumers use) imports
 *    it.
 *
 * Then: delete this module, drop `session.a2uiMessages` and the renderer stream, and let
 * consumers read the turns' activities directly. That is
 * a breaking change to `@coveo/thermidor`, which is intended and acceptable
 * while the package is `0.x`.
 */

import type {A2uiV09Message} from './types.js';

/** The A2-UI protocol version Agent Gateway emits. */
const GATEWAY_PROTOCOL_VERSION = 'v1.0';

/** The A2-UI protocol version every available renderer consumes. */
const RENDERER_PROTOCOL_VERSION = 'v0.9';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Maps a `createSurface.dataModel` key to the JSON Pointer it seeds, or null for an empty key. The
 * spec's inline data model is the surface's root object, so a plain key such as `isLoading` seeds
 * `/isLoading`. A key that is already a pointer (`/state/<nodeId>`) is kept as is. An empty key
 * names no property, and mapping it to `/` would overwrite the whole data model.
 */
function toDataModelPath(key: string): string | null {
  if (key.length === 0) {
    return null;
  }
  if (key.startsWith('/')) {
    return key;
  }
  return `/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
}

function createdSurfaceId(message: A2uiV09Message): string | null {
  const createSurface = message['createSurface'];
  return isRecord(createSurface) && typeof createSurface['surfaceId'] === 'string'
    ? createSurface['surfaceId']
    : null;
}

/**
 * Converts a single A2-UI v1.0 message into the equivalent v0.9 message(s).
 *
 * A message that does not declare `version: 'v1.0'` is forwarded verbatim, so an
 * already-v0.9 stream passes through untouched. A v1.0 message carrying no
 * recognized operation is unconvertible and is dropped rather than forwarded, so
 * a malformed message can never mutate renderer state; the previously rendered
 * UI stays displayed.
 */
function convertMessage(message: Record<string, unknown>): A2uiV09Message[] {
  if (message['version'] !== GATEWAY_PROTOCOL_VERSION) {
    return [message];
  }

  const createSurface = message['createSurface'];
  if (isRecord(createSurface)) {
    const surfaceId = createSurface['surfaceId'];
    if (typeof surfaceId !== 'string' || surfaceId.length === 0) {
      return [];
    }
    const catalogId = createSurface['catalogId'];
    if (typeof catalogId !== 'string' || catalogId.length === 0) {
      return [];
    }
    const components = createSurface['components'];
    const sendDataModel = createSurface['sendDataModel'];
    const dataModel = createSurface['dataModel'];

    const converted: A2uiV09Message[] = [
      {
        version: RENDERER_PROTOCOL_VERSION,
        createSurface: {
          surfaceId,
          catalogId,
          ...(typeof sendDataModel === 'boolean' ? {sendDataModel} : {}),
        },
      },
    ];

    if (Array.isArray(components) && components.length > 0) {
      converted.push({
        version: RENDERER_PROTOCOL_VERSION,
        updateComponents: {surfaceId, components},
      });
    }

    if (isRecord(dataModel)) {
      for (const [key, value] of Object.entries(dataModel)) {
        const path = toDataModelPath(key);
        if (path !== null) {
          converted.push({
            version: RENDERER_PROTOCOL_VERSION,
            updateDataModel: {surfaceId, path, value},
          });
        }
      }
    }

    return converted;
  }

  for (const operation of ['updateDataModel', 'updateComponents', 'deleteSurface'] as const) {
    const body = message[operation];
    if (isRecord(body)) {
      return [{version: RENDERER_PROTOCOL_VERSION, [operation]: body}];
    }
  }

  return [];
}

/**
 * Converts the raw A2-UI messages of one surface snapshot into the v0.9 messages a renderer
 * consumes, in order. See {@link convertMessage}.
 */
export function convertA2uiMessages(messages: readonly unknown[]): A2uiV09Message[] {
  const converted: A2uiV09Message[] = [];
  for (const message of messages) {
    if (isRecord(message)) {
      converted.push(...convertMessage(message));
    }
  }
  return converted;
}

/** The session's renderer stream, and the surfaces live at its end. */
export interface RendererStream {
  readonly messages: readonly A2uiV09Message[];
  readonly liveSurfaceIds: ReadonlySet<string>;
}

/** The stream of a session that has received nothing yet. */
export const EMPTY_RENDERER_STREAM: RendererStream = {messages: [], liveSurfaceIds: new Set()};

const SURFACE_OPERATIONS = ['updateComponents', 'updateDataModel'] as const;

function operationSurfaceId(message: A2uiV09Message, operation: string): string | null {
  const body = message[operation];
  return isRecord(body) && typeof body['surfaceId'] === 'string' ? body['surfaceId'] : null;
}

/**
 * Appends v0.9 messages to the session's renderer stream, which only grows: a renderer feeds each
 * new message once. The stream follows the A2-UI surface lifecycle across every run of the
 * session, so a renderer can process it in order:
 *
 * - a `createSurface` for a surface that is still live replaces it, as A2-UI defines: a
 *   `deleteSurface` for that surface is appended before it, since a renderer refuses to create a
 *   surface that exists;
 * - a `deleteSurface`, `updateComponents` or `updateDataModel` for a surface that is not live is
 *   dropped, since there is nothing to apply it to.
 */
export function appendToRendererStream(
  stream: RendererStream,
  messages: readonly A2uiV09Message[]
): RendererStream {
  const appended: A2uiV09Message[] = [];
  const live = new Set(stream.liveSurfaceIds);
  for (const message of messages) {
    const createdId = createdSurfaceId(message);
    if (createdId !== null) {
      if (live.has(createdId)) {
        appended.push({version: RENDERER_PROTOCOL_VERSION, deleteSurface: {surfaceId: createdId}});
      }
      live.add(createdId);
      appended.push(message);
      continue;
    }
    const deletedId = operationSurfaceId(message, 'deleteSurface');
    if (deletedId !== null) {
      if (live.delete(deletedId)) {
        appended.push(message);
      }
      continue;
    }
    const targetId =
      SURFACE_OPERATIONS.map((operation) => operationSurfaceId(message, operation)).find(
        (surfaceId) => surfaceId !== null
      ) ?? null;
    if (targetId === null || live.has(targetId)) {
      appended.push(message);
    }
  }
  if (appended.length === 0) {
    return stream;
  }
  return {messages: [...stream.messages, ...appended], liveSurfaceIds: live};
}
