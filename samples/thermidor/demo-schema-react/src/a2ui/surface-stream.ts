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
  /** The `component` of each render surface's `root` node, e.g. `CommerceSearch`. */
  rootComponents: ReadonlyMap<string, string>;
}

export function buildSurfaceStream(turns: readonly Turn[]): SurfaceStream {
  const messages: A2uiV09Message[] = [];
  const surfacesByTurn = new Map<string, string[]>();
  const serverSurfaceIds = new Map<string, string>();
  const renderIdByServerId = new Map<string, string>();
  const ownerTurnByRenderId = new Map<string, string>();
  const loadingSurfaces = new Map<string, string>();
  const rootComponents = new Map<string, string>();

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
      const rootComponent = findRootComponent(body);
      if (rootComponent !== undefined) {
        rootComponents.set(renderId, rootComponent);
      }

      if (operation === 'deleteSurface') {
        renderIdByServerId.delete(serverId);
        loadingSurfaces.delete(renderId);
        const owner = surfacesByTurn.get(ownerTurnByRenderId.get(renderId)!)!;
        owner.splice(owner.indexOf(renderId), 1);
      }
    }

    for (const surface of turn.response.surfaces) {
      const renderId = `${turn.id}/${surface.surfaceId}`;
      if (surface.isLoading && turnSurfaces.includes(renderId)) {
        loadingSurfaces.set(renderId, surface.rootComponentType);
      }
    }
  }

  return {messages, surfacesByTurn, serverSurfaceIds, loadingSurfaces, rootComponents};
}

/** The root component kind of the gateway's search surface, which no agent may emit. */
export const SEARCH_ROOT_COMPONENT = 'CommerceSearch';

/** Whether a render surface is a gateway search surface rather than part of an answer. */
export function isSearchSurface(stream: SurfaceStream, renderId: string): boolean {
  return stream.rootComponents.get(renderId) === SEARCH_ROOT_COMPONENT;
}

/** The root component kind of an agent's suggested next actions. */
export const ACTION_BAR_ROOT_COMPONENT = 'NextActionsBar';

/** Whether a render surface is a bar of suggested next actions. */
export function isActionBar(stream: SurfaceStream, renderId: string): boolean {
  return stream.rootComponents.get(renderId) === ACTION_BAR_ROOT_COMPONENT;
}

/**
 * Whether a render surface is a visual answer block (carousel, comparison, bundle, research), as
 * opposed to a search surface or a bar of next actions.
 */
export function isAnswerBlock(stream: SurfaceStream, renderId: string): boolean {
  const root = stream.rootComponents.get(renderId);
  return root !== undefined && root !== SEARCH_ROOT_COMPONENT && root !== ACTION_BAR_ROOT_COMPONENT;
}

/**
 * The bars of next actions created before a newer search surface. Their suggestions were made
 * for results that are no longer shown, so the agent may no longer find what they name.
 */
export function actionBarsBeforeLatestSearch(
  stream: SurfaceStream,
  turns: readonly Turn[]
): ReadonlySet<string> {
  const stale = new Set<string>();
  const seen: string[] = [];
  for (const turn of turns) {
    for (const renderId of stream.surfacesByTurn.get(turn.id) ?? []) {
      if (isActionBar(stream, renderId)) {
        seen.push(renderId);
      } else if (isSearchSurface(stream, renderId)) {
        for (const bar of seen) stale.add(bar);
      }
    }
  }
  return stale;
}

/** The most recently created search surface still on screen, if any. */
export function latestSearchSurfaceId(
  stream: SurfaceStream,
  turns: readonly Turn[]
): string | undefined {
  for (const turn of [...turns].reverse()) {
    const surfaceIds = stream.surfacesByTurn.get(turn.id) ?? [];
    const search = surfaceIds.findLast((renderId) => isSearchSurface(stream, renderId));
    if (search !== undefined) {
      return search;
    }
  }
  return undefined;
}

function findRootComponent(body: Record<string, unknown>): string | undefined {
  const components = body['components'];
  if (!Array.isArray(components)) {
    return undefined;
  }
  const root = components.find((node) => isRecord(node) && node['id'] === 'root');
  return isRecord(root) && typeof root['component'] === 'string' ? root['component'] : undefined;
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
