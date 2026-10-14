import type {A2uiV09Message, Turn} from '@coveo/thermidor';
import {isRecord} from '../utils.js';

const SURFACE_OPERATIONS = [
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
] as const;

/**
 * The whole session's A2-UI messages as one renderer stream, so a single page can draw every
 * turn's blocks in place.
 *
 * Servers may reuse a surface id across turns (the mock server does), and a later
 * `createSurface` would then replace an earlier turn's block in the shared renderer. Each
 * surface is therefore drawn under a render id scoped to the turn that created it; operations in
 * later turns are re-addressed to that render id, so an update lands on the block it targets.
 */
export interface SurfaceStream {
  /** Every turn's renderer messages, in order, addressed to render surface ids. */
  messages: A2uiV09Message[];
  /** The render surface ids each turn draws, in creation order, keyed by turn id. */
  surfacesByTurn: ReadonlyMap<string, readonly string[]>;
  /** The server surface id behind each render surface id. */
  serverSurfaceIds: ReadonlyMap<string, string>;
}

export function buildSurfaceStream(turns: readonly Turn[]): SurfaceStream {
  const messages: A2uiV09Message[] = [];
  const surfacesByTurn = new Map<string, string[]>();
  const serverSurfaceIds = new Map<string, string>();
  const renderIdByServerId = new Map<string, string>();
  const ownerTurnByRenderId = new Map<string, string>();

  for (const turn of turns) {
    surfacesByTurn.set(turn.id, []);
    for (const message of turn.response.a2uiMessages) {
      const operation = SURFACE_OPERATIONS.find((name) => isRecord(message[name]));
      const body = operation ? (message[operation] as Record<string, unknown>) : undefined;
      const serverId = typeof body?.['surfaceId'] === 'string' ? body['surfaceId'] : undefined;
      if (!operation || !body || serverId === undefined) {
        messages.push(message);
        continue;
      }

      if (operation === 'createSurface') {
        const renderId = `${turn.id}/${serverId}`;
        renderIdByServerId.set(serverId, renderId);
        serverSurfaceIds.set(renderId, serverId);
        ownerTurnByRenderId.set(renderId, turn.id);
        const turnSurfaces = surfacesByTurn.get(turn.id)!;
        if (!turnSurfaces.includes(renderId)) {
          turnSurfaces.push(renderId);
        }
      }

      const renderId = renderIdByServerId.get(serverId);
      if (renderId === undefined) {
        // An operation on a surface no turn created has nothing to draw on.
        continue;
      }
      messages.push({...message, [operation]: {...body, surfaceId: renderId}});

      if (operation === 'deleteSurface') {
        renderIdByServerId.delete(serverId);
        const owner = surfacesByTurn.get(ownerTurnByRenderId.get(renderId)!)!;
        owner.splice(owner.indexOf(renderId), 1);
      }
    }
  }

  return {messages, surfacesByTurn, serverSurfaceIds};
}

/**
 * Re-addresses a renderer action from its render surface id to the server surface id the
 * session and the gateway know.
 */
export function toServerAction<T>(message: T, serverSurfaceIds: ReadonlyMap<string, string>): T {
  if (!isRecord(message) || !isRecord(message['userAction'])) {
    return message;
  }
  const userAction = message['userAction'];
  const serverId =
    typeof userAction['surfaceId'] === 'string'
      ? serverSurfaceIds.get(userAction['surfaceId'])
      : undefined;
  if (serverId === undefined) {
    return message;
  }
  return {...message, userAction: {...userAction, surfaceId: serverId}} as T;
}
