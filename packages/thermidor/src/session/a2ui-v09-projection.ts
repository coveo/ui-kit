/**
 * A2-UI v0.9 renderer projection — RECORDED INTERIM DEBT (ADR-015 addendum).
 *
 * This module is the SINGLE location in the package that rewrites an A2-UI
 * message envelope, and the only place that knows a renderer's wire shape. It
 * exists because the two ends of the protocol are pinned one minor version
 * apart with nothing in between:
 *
 * - Agent Gateway emits A2-UI **v1.0** exclusively. `A2uiMessage.VERSION` is
 *   `"v1.0"` and it throws on any other version, on both construct and parse,
 *   and its snapshot/state path is v1.0-only by construction.
 * - Every renderer available to a consumer is **v0.9**.
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
 * ## What is load-bearing, and what is cosmetic
 *
 * Exactly one transformation makes rendering work: **splitting v1.0's single
 * `createSurface` into `createSurface` + `updateComponents`**. The v0.9
 * `processCreateSurfaceMessage` destructures only
 * `{ surfaceId, catalogId, theme, sendDataModel }` from the operation, so a
 * surface's inline `components[]` are silently discarded unless re-delivered
 * under a separate `updateComponents` operation.
 *
 * The emitted `version: 'v0.9'` is **cosmetic**. `processMessage` dispatches
 * purely on which operation key is present — it never reads `version`, and
 * stamps `version: 'v0.9'` onto its own normalized output regardless of what
 * arrived. It is emitted only so the message stream is legible as v0.9 when
 * inspected in devtools or test fixtures.
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
 * Then: delete this module, drop `a2uiMessages` from {@link TurnResponse} and
 * from the fold, and let consumers read `response.activities` directly. That is
 * a breaking change to `@coveo/thermidor`, which is intended and acceptable
 * while the package is `0.x`.
 */

import type {A2uiV09Message, Activity} from './types.js';

/** Activity kind carrying A2-UI surface messages. */
const SURFACE_ACTIVITY_KIND = 'a2ui-surface';

/** The A2-UI protocol version Agent Gateway emits. */
const GATEWAY_PROTOCOL_VERSION = 'v1.0';

/** The A2-UI protocol version every available renderer consumes. */
const RENDERER_PROTOCOL_VERSION = 'v0.9';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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
    const components = createSurface['components'];

    const converted: A2uiV09Message[] = [
      {
        version: RENDERER_PROTOCOL_VERSION,
        createSurface: {
          surfaceId,
          ...(typeof catalogId === 'string' ? {catalogId} : {}),
        },
      },
    ];

    if (Array.isArray(components) && components.length > 0) {
      converted.push({
        version: RENDERER_PROTOCOL_VERSION,
        updateComponents: {surfaceId, components},
      });
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
 * Derives the ordered A2-UI v0.9 message stream borne by a turn's activities.
 *
 * Surface-bearing activities carry their A2-UI sequence under
 * `payload.messages`. Messages are grouped by activity id so a `replace`
 * snapshot supersedes the earlier messages for that id in place rather than
 * appending duplicates, and the result is flattened in order of each activity's
 * first appearance.
 *
 * This is a pure derivation of `activities`: dropping the result and recomputing
 * it from the same activity list yields a deeply-equal stream.
 */
export function deriveA2uiV09Messages(activities: Activity[]): A2uiV09Message[] {
  const messagesByActivityId = new Map<string, A2uiV09Message[]>();
  const activityOrder: string[] = [];

  for (const activity of activities) {
    if (activity.kind !== SURFACE_ACTIVITY_KIND || !isRecord(activity.payload)) {
      continue;
    }

    const rawMessages = activity.payload['messages'];
    if (!Array.isArray(rawMessages)) {
      continue;
    }

    const converted: A2uiV09Message[] = [];
    for (const message of rawMessages) {
      if (isRecord(message)) {
        converted.push(...convertMessage(message));
      }
    }

    if (activity.replace) {
      messagesByActivityId.set(activity.id, converted);
    } else {
      const existing = messagesByActivityId.get(activity.id) ?? [];
      existing.push(...converted);
      messagesByActivityId.set(activity.id, existing);
    }

    if (!activityOrder.includes(activity.id)) {
      activityOrder.push(activity.id);
    }
  }

  const stream: A2uiV09Message[] = [];
  for (const activityId of activityOrder) {
    const messages = messagesByActivityId.get(activityId);
    if (messages) {
      stream.push(...messages);
    }
  }
  return stream;
}
