/**
 * A2-UI v0.9 renderer projection — RECORDED INTERIM DEBT (ADR-015 addendum).
 *
 * This module is the SINGLE location in the package that rewrites an A2-UI
 * message envelope, and the only place that knows a renderer's wire shape. It
 * exists because the two ends of the protocol are pinned one minor version
 * apart with nothing in between:
 *
 * - Agent Gateway emits A2-UI **v1.0** exclusively
 *   (https://a2ui.org/specification/v1.0-a2ui/): today the spec Candidate,
 *   with envelope `version: "v1.0"` and `{ "path" }` bindings, and soon the
 *   final version, with envelope `version: "1.0"` and `{ "@path" }` bindings.
 *   See "Dual input" below.
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
 * One transformation makes rendering work: **splitting v1.0's single
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
 * A second transformation keeps the data model right: **a v1.0 deletion becomes
 * a v0.9 deletion**. v1.0 deletes the key at `path` with an explicit
 * `value: null` (Agent Gateway sends one for each slice a re-projected surface
 * dropped, such as a facet the new results no longer have). v0.9 deletes it when
 * `value` is omitted, and its `DataModel.set` stores a `null` as a value. So an
 * `updateDataModel` with `value: null` is forwarded without `value`, and an inline
 * `createSurface.dataModel` key set to `null` seeds nothing.
 *
 * Everything else is pass-through. Under the flat A2-UI v1.0 node model a node
 * carries a single `id`/`component` identity plus its presentation values, A2-UI
 * Data_Binding objects, and composition links directly at the top level — there
 * is no `props` wrapper, which is already the shape the v0.9 renderer mounts.
 * Candidate (`"v1.0"`) nodes, whose bindings are already v0.9's
 * `{ "path": <JSON Pointer> }`, are forwarded unchanged: there, `@path` is not a
 * binding marker, so an `{ "@path": … }` value is a literal and stays as it is.
 * Final (`"1.0"`) nodes are copied, except that an exact
 * `{ "@path": <JSON Pointer> }` binding becomes `{ "path": <JSON Pointer> }`.
 * Component ids are never rewritten, whether snake_case (final 1.0) or
 * hyphenated (candidate).
 *
 * ## Dual input (transitional)
 *
 * While Agent Gateway switches from the v1.0 candidate to the final v1.0, the
 * projection reads both and produces the same v0.9 output for each, so a v0.9
 * renderer keeps working across the switch with no change of its own:
 *
 * - `version: "v1.0"` (candidate) and `version: "1.0"` (final) envelopes get the
 *   same conversion and the same surface lifecycle rules;
 * - in the component nodes of a `"1.0"` message only (`createSurface.components`,
 *   `updateComponents.components`), a final binding becomes a v0.9 binding:
 *   `{ "@path": x }` becomes `{ "path": x }`, at any depth (child props, named
 *   slots, action contexts). A binding is an object whose only key is `@path`,
 *   holding a string, the rule Agent Gateway applies. Other `path` keys are data,
 *   not bindings, and are left alone: `updateDataModel.path`, a ChildList template
 *   `{ componentId, path }`, and data-model values such as a category facet's
 *   `path`. A candidate `"v1.0"` message is converted as before: there, `@path` is
 *   not a binding marker. Agent Gateway switches the envelope and the bindings
 *   together, so the two never arrive mixed.
 *
 * Once Agent Gateway emits only the final version, the `"v1.0"` input is dead
 * code; it goes with the rest of this module (see "Removal trigger").
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
 * Then: delete this module and carry the gateway's final v1.0 messages to the
 * renderer unchanged (https://github.com/coveo/ui-kit/pull/9017 does this for
 * `@a2ui/react` 0.16). That is a breaking change to `@coveo/thermidor`, which is
 * intended and acceptable while the package is `0.x`.
 */

import type {A2uiV09Message} from './types.js';

/** The final A2-UI v1.0 version, whose data bindings are `{"@path"}`. */
const FINAL_PROTOCOL_VERSION = '1.0';

/**
 * The A2-UI protocol versions Agent Gateway emits: `"v1.0"`, the candidate it emits today, and
 * `"1.0"`, the final version it switches to.
 */
const GATEWAY_PROTOCOL_VERSIONS: ReadonlySet<unknown> = new Set(['v1.0', '1.0']);

/** The A2-UI protocol version every available renderer consumes. */
export const RENDERER_PROTOCOL_VERSION = 'v0.9';

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

/**
 * Whether `value` is a final v1.0 data binding: an object whose only key is `@path`, holding a
 * string. Agent Gateway applies the same rule.
 */
function isFinalBinding(value: Record<string, unknown>): value is {'@path': string} {
  const keys = Object.keys(value);
  return keys.length === 1 && keys[0] === '@path' && typeof value['@path'] === 'string';
}

/**
 * Rewrites every final v1.0 data binding `{"@path": x}` in a component node, at any depth, as the
 * v0.9 binding `{"path": x}`. Everything else is kept, including objects that merely have a `path`
 * key among others, such as a ChildList template `{componentId, path}`. The input is never mutated.
 */
function toV09Bindings(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toV09Bindings);
  }
  if (!isRecord(value)) {
    return value;
  }
  if (isFinalBinding(value)) {
    return {path: value['@path']};
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, toV09Bindings(item)]));
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
 * A message that declares neither `version: 'v1.0'` nor `version: '1.0'` is forwarded verbatim,
 * so an already-v0.9 stream passes through untouched. Both gateway versions get the same
 * conversion; in a `"1.0"` message only, `{"@path"}` bindings also become v0.9 `{"path"}` bindings.
 * A v1.0 message carrying no recognized operation is unconvertible and is dropped rather than
 * forwarded, so a malformed message can never mutate renderer state; the previously rendered UI
 * stays displayed.
 */
function convertMessage(message: Record<string, unknown>): A2uiV09Message[] {
  if (!GATEWAY_PROTOCOL_VERSIONS.has(message['version'])) {
    return [message];
  }
  const isFinal = message['version'] === FINAL_PROTOCOL_VERSION;

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
        updateComponents: {surfaceId, components: isFinal ? toV09Bindings(components) : components},
      });
    }

    if (isRecord(dataModel)) {
      for (const [key, value] of Object.entries(dataModel)) {
        const path = toDataModelPath(key);
        if (path !== null && value !== null) {
          converted.push({
            version: RENDERER_PROTOCOL_VERSION,
            updateDataModel: {surfaceId, path, value},
          });
        }
      }
    }

    return converted;
  }

  const update = message['updateDataModel'];
  if (isRecord(update)) {
    // A2-UI v1.0 deletes a key with `value: null`; v0.9 deletes it when `value` is omitted.
    if (update['value'] === null) {
      const {value: _deleted, ...deletion} = update;
      return [{version: RENDERER_PROTOCOL_VERSION, updateDataModel: deletion}];
    }
    return [{version: RENDERER_PROTOCOL_VERSION, updateDataModel: update}];
  }

  const updateComponents = message['updateComponents'];
  if (isRecord(updateComponents)) {
    return [
      {
        version: RENDERER_PROTOCOL_VERSION,
        updateComponents:
          isFinal && 'components' in updateComponents
            ? {...updateComponents, components: toV09Bindings(updateComponents['components'])}
            : updateComponents,
      },
    ];
  }

  const deleteSurface = message['deleteSurface'];
  if (isRecord(deleteSurface)) {
    return [{version: RENDERER_PROTOCOL_VERSION, deleteSurface}];
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
