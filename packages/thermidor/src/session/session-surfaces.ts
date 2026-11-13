/**
 * Session-scoped surfaces (ADR-018).
 *
 * The session derives its surfaces from one ordered activity log: the initialization's activities,
 * then each turn's, in order. A surface lives from its `createSurface` until its `deleteSurface`,
 * whichever runs carry them, and a `createSurface` for a live id replaces that surface. The fold
 * keeps per-run projections; this module derives the session-wide ones and narrows each turn's
 * `surfaces` to the live surfaces it created. A replaced surface stays with the turn that first
 * created it.
 */

import {deriveSurfaces, SURFACE_ACTIVITY_KIND} from './fold.js';
import type {Activity, DiscoveredSurface, SessionInitialization, Turn} from './types.js';

/** The session's runs: its initialization, when it sent one, then its turns. */
export interface SessionRuns {
  turns: readonly Turn[];
  initialization?: SessionInitialization;
}

/** The run a request's events are recorded with. */
export type RunTarget = {kind: 'turn'; turnId: string} | {kind: 'initialization'};

export const INITIALIZATION: RunTarget = {kind: 'initialization'};

/** The session's surfaces, derived from every run's activities. */
export interface SessionSurfaceView {
  /** The turns, each with its `surfaces` narrowed to the live surfaces it created. */
  turns: readonly Turn[];
  /** Every live surface, in creation order. */
  surfaces: readonly DiscoveredSurface[];
  /**
   * The turn that first created each surface still alive, by surface id: a later `createSurface`
   * for the live id leaves it there. A surface the initialization created has none.
   */
  ownerTurnIds: ReadonlyMap<string, string>;
}

/** The initialization's activities, then every turn's, in order: the session's activity log. */
export function sessionActivities({turns, initialization}: SessionRuns): Activity[] {
  return [
    ...(initialization?.activities ?? []),
    ...turns.flatMap((turn) => turn.response.activities),
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function surfaceLifecycle(message: unknown): {
  created?: string;
  rendered?: boolean;
  deleted?: string;
} {
  if (!isRecord(message)) {
    return {};
  }
  const createSurface = message['createSurface'];
  if (isRecord(createSurface) && typeof createSurface['surfaceId'] === 'string') {
    const catalogId = createSurface['catalogId'];
    return {
      created: createSurface['surfaceId'],
      rendered: typeof catalogId === 'string' && catalogId.length > 0,
    };
  }
  const deleteSurface = message['deleteSurface'];
  if (isRecord(deleteSurface) && typeof deleteSurface['surfaceId'] === 'string') {
    return {deleted: deleteSurface['surfaceId']};
  }
  return {};
}

/** Which turns hold each surface still alive, by surface id. */
interface SurfaceRuns {
  /** The turn that first created it, where a transcript draws it. */
  ownerTurnIds: Map<string, string>;
  /**
   * The turn whose activities hold its latest `createSurface`, which decides whether its loading
   * placeholder still streams. A surface the initialization last created has none.
   */
  creatorTurnIds: Map<string, string>;
}

/**
 * Which turns hold each surface still alive. Follows the surface lifecycle as the node registry
 * does, so a surface the projection leaves out (no catalog, no root) still has its turns. A
 * `createSurface` for an id the renderer stream holds, such as the answer to an action recorded
 * with a later turn, keeps the surface's owner; the stream holds an id from a `createSurface` with
 * a catalog until its `deleteSurface`.
 */
function deriveSurfaceRuns({turns, initialization}: SessionRuns): SurfaceRuns {
  const ownerTurnIds = new Map<string, string>();
  const creatorTurnIds = new Map<string, string>();
  const rendered = new Set<string>();
  const runs = [
    {turnId: undefined, activities: initialization?.activities ?? []},
    ...turns.map((turn) => ({turnId: turn.id, activities: turn.response.activities})),
  ];
  for (const {turnId, activities} of runs) {
    for (const activity of activities) {
      const messages =
        activity.kind === SURFACE_ACTIVITY_KIND ? activity.payload['messages'] : null;
      for (const message of Array.isArray(messages) ? messages : []) {
        const {created, rendered: isRendered, deleted} = surfaceLifecycle(message);
        if (created !== undefined) {
          const runIds = rendered.has(created) ? [creatorTurnIds] : [ownerTurnIds, creatorTurnIds];
          for (const ids of runIds) {
            if (turnId === undefined) {
              ids.delete(created);
            } else {
              ids.set(created, turnId);
            }
          }
          if (isRendered) {
            rendered.add(created);
          }
        } else if (deleted !== undefined) {
          ownerTurnIds.delete(deleted);
          creatorTurnIds.delete(deleted);
          rendered.delete(deleted);
        }
      }
    }
  }
  return {ownerTurnIds, creatorTurnIds};
}

/** The status of the run `target` records, or `undefined` once that run is gone. */
export function targetStatus({turns, initialization}: SessionRuns, target: RunTarget) {
  return target.kind === 'turn'
    ? turns.find((turn) => turn.id === target.turnId)?.status
    : initialization?.status;
}

function isCreatedBy(
  creatorTurnIds: ReadonlyMap<string, string>,
  surfaceId: string,
  target: RunTarget
): boolean {
  return creatorTurnIds.get(surfaceId) === (target.kind === 'turn' ? target.turnId : undefined);
}

/**
 * The loading placeholders `target` has already abandoned: those it created while it is not
 * streaming. Read when a request starts streaming into that run, so they stay out of the lists
 * while it runs.
 */
export function abandonedPlaceholderIds(runs: SessionRuns, target: RunTarget): ReadonlySet<string> {
  const status = targetStatus(runs, target);
  if (status === undefined || status === 'streaming') {
    return new Set();
  }
  const {creatorTurnIds} = deriveSurfaceRuns(runs);
  return new Set(
    deriveSurfaces(sessionActivities(runs))
      .filter(
        (surface) => surface.isLoading && isCreatedBy(creatorTurnIds, surface.surfaceId, target)
      )
      .map((surface) => surface.surfaceId)
  );
}

/**
 * Derives the session's live surfaces from its runs, and narrows each turn's to its own. A loading
 * placeholder is listed only while the run that last created it streams: while its turn or the
 * initialization is `streaming`, or while the request in flight streams into it (`streamingTarget`),
 * unless it was already abandoned when that request started (`abandonedIds`). One the agent left
 * behind once its run ended (a cancelled run, an error, a restored session) is abandoned and leaves
 * the lists.
 */
export function deriveSessionSurfaces(
  runs: SessionRuns,
  streamingTarget?: RunTarget,
  abandonedIds: ReadonlySet<string> = new Set()
): SessionSurfaceView {
  const {turns, initialization} = runs;
  const {ownerTurnIds, creatorTurnIds} = deriveSurfaceRuns(runs);

  const streamingTurnIds = new Set(
    turns.filter((turn) => turn.status === 'streaming').map((turn) => turn.id)
  );
  if (streamingTarget?.kind === 'turn') {
    streamingTurnIds.add(streamingTarget.turnId);
  }
  const initializationStreams =
    initialization?.status === 'streaming' || streamingTarget?.kind === 'initialization';
  const isStreaming = (surfaceId: string) => {
    const creatorTurnId = creatorTurnIds.get(surfaceId);
    return creatorTurnId === undefined
      ? initializationStreams
      : streamingTurnIds.has(creatorTurnId);
  };
  const surfaces = deriveSurfaces(sessionActivities(runs)).filter(
    (surface) =>
      !surface.isLoading || (isStreaming(surface.surfaceId) && !abandonedIds.has(surface.surfaceId))
  );

  return {
    turns: turns.map((turn) => ({
      ...turn,
      response: {
        ...turn.response,
        surfaces: surfaces.filter((surface) => ownerTurnIds.get(surface.surfaceId) === turn.id),
      },
    })),
    surfaces,
    ownerTurnIds,
  };
}
