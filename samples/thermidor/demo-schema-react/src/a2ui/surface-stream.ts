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
  /**
   * The root component type of each render surface that is a loading placeholder, read from the
   * session's typed `response.surfaces`. A placeholder is the surface its own turn created under
   * that server id, never an earlier turn's block that reuses the id.
   */
  loadingSurfaces: ReadonlyMap<string, string>;
  /**
   * The latest Scoping block, where the user sees and changes the Selection that scopes every
   * question. It is drawn once for the whole thread rather than under its turn, so it is not in
   * `surfacesByTurn`.
   */
  scoping?: ScopingSurface;
}

/** A Scoping block's render surface id, and the turn that created it. */
export interface ScopingSurface {
  surfaceId: string;
  turnId: string;
}

export interface SurfaceStreamOptions {
  /**
   * Whether a server surface id is a Scoping block. The server decides how it marks one, so the
   * caller says which blocks are; without it, every block stays under its turn.
   */
  isScoping?: (serverSurfaceId: string) => boolean;
}

const NEVER_SCOPING = () => false;

export function buildSurfaceStream(
  turns: readonly Turn[],
  {isScoping = NEVER_SCOPING}: SurfaceStreamOptions = {}
): SurfaceStream {
  const messages: A2uiV09Message[] = [];
  const surfacesByTurn = new Map<string, string[]>();
  const serverSurfaceIds = new Map<string, string>();
  const renderIdByServerId = new Map<string, string>();
  const ownerTurnByRenderId = new Map<string, string>();
  const loadingSurfaces = new Map<string, string>();
  let scoping: ScopingSurface | undefined;

  for (const turn of turns) {
    const turnSurfaces: string[] = [];
    surfacesByTurn.set(turn.id, turnSurfaces);
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
        if (isScoping(serverId)) {
          scoping = {surfaceId: renderId, turnId: turn.id};
        } else if (!turnSurfaces.includes(renderId)) {
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
        loadingSurfaces.delete(renderId);
        if (scoping?.surfaceId === renderId) {
          scoping = undefined;
        }
        const owner = surfacesByTurn.get(ownerTurnByRenderId.get(renderId)!)!;
        const index = owner.indexOf(renderId);
        if (index !== -1) {
          owner.splice(index, 1);
        }
      }
    }

    for (const surface of turn.response.surfaces) {
      const renderId = `${turn.id}/${surface.surfaceId}`;
      if (surface.isLoading && renderIdByServerId.get(surface.surfaceId) === renderId) {
        loadingSurfaces.set(renderId, surface.rootComponentType);
      }
    }
  }

  return {
    messages,
    surfacesByTurn,
    serverSurfaceIds,
    loadingSurfaces,
    ...(scoping ? {scoping} : {}),
  };
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
