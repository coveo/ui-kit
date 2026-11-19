/**
 * The session-wide renderer stream (`Session.a2uiMessages`): every A2-UI v1.0 message Agent
 * Gateway streamed, across all of the session's runs, in the order a renderer must process them.
 *
 * Messages are forwarded unchanged. A renderer processes them with a single long-lived
 * `@a2ui/web_core` `MessageProcessor`, which is built for one continuous protocol stream. The
 * session's stream is instead the concatenation of independent runs, and each run starts from
 * whatever its own surface snapshots say, so the stream keeps the two lifecycle rules the processor
 * needs to accept that concatenation. The processor's v1.0 path (`processCreateSurfaceOp`,
 * `processUpdateComponentsOp`, `processUpdateDataModelOp`) throws an integrity error otherwise, and
 * a throw abandons the rest of the batch it was processing:
 *
 * - a `createSurface` for a surface that is still live is preceded by a `deleteSurface` for that
 *   surface. A2-UI defines re-creation as replacement for the session, but the spec makes
 *   creating an existing surface an error for the renderer ("It is an error to try to create a
 *   surface with an existing ID without first deleting it"), and the processor throws
 *   `Surface <id> already exists.`;
 * - an `updateComponents` or `updateDataModel` for a surface that is not live is dropped: the
 *   processor throws `Surface not found for message`. Such a message reaches the stream when a
 *   run, or a concurrent answer, writes to a surface that another run already deleted.
 *
 * Nothing else is needed. A `deleteSurface` for a surface that is not live is forwarded, because the
 * processor ignores it. An `updateDataModel` with `value: null` is forwarded as is, because v1.0
 * defines it as a deletion and the processor's v1.0 data model deletes the key.
 *
 * Only messages whose envelope `version` is `"1.0"` enter the stream, the version Agent Gateway
 * emits and the only one the processor's v1.0 schema accepts. Anything else is dropped, so a
 * message from another protocol version can never reach a v1.0 renderer.
 */

import {devWarn} from '@/src/internal/utils/dev-warn.js';
import type {A2uiMessage} from './types.js';

/** The A2-UI protocol version Agent Gateway emits and the renderer stream carries. */
const PROTOCOL_VERSION = '1.0';

/** The session's renderer stream, and the surfaces live at its end. */
export interface RendererStream {
  readonly messages: readonly A2uiMessage[];
  readonly liveSurfaceIds: ReadonlySet<string>;
}

/** The stream of a session that has received nothing yet. */
export const EMPTY_RENDERER_STREAM: RendererStream = {messages: [], liveSurfaceIds: new Set()};

const UPDATE_OPERATIONS = ['updateComponents', 'updateDataModel'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isA2uiMessage(message: unknown): message is A2uiMessage {
  return isRecord(message) && message['version'] === PROTOCOL_VERSION;
}

function operationSurfaceId(message: A2uiMessage, operation: string): string | null {
  const body = message[operation];
  return isRecord(body) && typeof body['surfaceId'] === 'string' ? body['surfaceId'] : null;
}

/**
 * Appends the raw A2-UI messages of a surface snapshot to the session's renderer stream, which only
 * grows: a renderer feeds each new message once. See the module documentation for the lifecycle
 * rules it applies.
 */
export function appendToRendererStream(
  stream: RendererStream,
  messages: readonly unknown[]
): RendererStream {
  const appended: A2uiMessage[] = [];
  const live = new Set(stream.liveSurfaceIds);
  for (const message of messages) {
    if (!isA2uiMessage(message)) {
      devWarn(
        `A2-UI message dropped from the renderer stream: its version is not "${PROTOCOL_VERSION}".`
      );
      continue;
    }
    const createdId = operationSurfaceId(message, 'createSurface');
    if (createdId !== null) {
      if (live.has(createdId)) {
        appended.push({version: PROTOCOL_VERSION, deleteSurface: {surfaceId: createdId}});
      }
      live.add(createdId);
      appended.push(message);
      continue;
    }
    const deletedId = operationSurfaceId(message, 'deleteSurface');
    if (deletedId !== null) {
      live.delete(deletedId);
      appended.push(message);
      continue;
    }
    const targetId =
      UPDATE_OPERATIONS.map((operation) => operationSurfaceId(message, operation)).find(
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
