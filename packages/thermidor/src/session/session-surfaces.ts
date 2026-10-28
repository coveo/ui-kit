/**
 * Session-scoped surfaces (ADR-018).
 *
 * The session derives its surfaces from one ordered activity log: the initialization's activities,
 * then each turn's, in order. A surface lives from its `createSurface` until its `deleteSurface`,
 * whichever runs carry them, and a `createSurface` for a live id replaces that surface. The fold
 * keeps per-run projections; this module derives the session-wide ones and narrows each turn's
 * `surfaces` to the live surfaces it created.
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
   * The turn that created each surface still alive, by surface id. A surface the initialization
   * created has none.
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

function surfaceLifecycle(message: unknown): {created?: string; deleted?: string} {
  if (!isRecord(message)) {
    return {};
  }
  const createSurface = message['createSurface'];
  if (isRecord(createSurface) && typeof createSurface['surfaceId'] === 'string') {
    return {created: createSurface['surfaceId']};
  }
  const deleteSurface = message['deleteSurface'];
  if (isRecord(deleteSurface) && typeof deleteSurface['surfaceId'] === 'string') {
    return {deleted: deleteSurface['surfaceId']};
  }
  return {};
}

/**
 * The turn that created each surface still alive, by surface id. Follows the surface lifecycle as
 * the node registry does, so a surface the projection leaves out (no catalog, no root) still has
 * the turn that created it.
 */
function deriveOwnerTurnIds({turns, initialization}: SessionRuns): Map<string, string> {
  const ownerTurnIds = new Map<string, string>();
  const runs = [
    {turnId: undefined, activities: initialization?.activities ?? []},
    ...turns.map((turn) => ({turnId: turn.id, activities: turn.response.activities})),
  ];
  for (const {turnId, activities} of runs) {
    for (const activity of activities) {
      const messages =
        activity.kind === SURFACE_ACTIVITY_KIND ? activity.payload['messages'] : null;
      for (const message of Array.isArray(messages) ? messages : []) {
        const {created, deleted} = surfaceLifecycle(message);
        if (created !== undefined && turnId !== undefined) {
          ownerTurnIds.set(created, turnId);
        } else if (created !== undefined) {
          ownerTurnIds.delete(created);
        } else if (deleted !== undefined) {
          ownerTurnIds.delete(deleted);
        }
      }
    }
  }
  return ownerTurnIds;
}

/** The status of the run `target` records, or `undefined` once that run is gone. */
export function targetStatus({turns, initialization}: SessionRuns, target: RunTarget) {
  return target.kind === 'turn'
    ? turns.find((turn) => turn.id === target.turnId)?.status
    : initialization?.status;
}

function isCreatedBy(
  ownerTurnIds: ReadonlyMap<string, string>,
  surfaceId: string,
  target: RunTarget
): boolean {
  return ownerTurnIds.get(surfaceId) === (target.kind === 'turn' ? target.turnId : undefined);
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
  const ownerTurnIds = deriveOwnerTurnIds(runs);
  return new Set(
    deriveSurfaces(sessionActivities(runs))
      .filter(
        (surface) => surface.isLoading && isCreatedBy(ownerTurnIds, surface.surfaceId, target)
      )
      .map((surface) => surface.surfaceId)
  );
}

/**
 * Derives the session's live surfaces from its runs, and narrows each turn's to its own. A loading
 * placeholder is listed only while the run that created it streams: while its turn or the
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
  const ownerTurnIds = deriveOwnerTurnIds(runs);

  const streamingTurnIds = new Set(
    turns.filter((turn) => turn.status === 'streaming').map((turn) => turn.id)
  );
  if (streamingTarget?.kind === 'turn') {
    streamingTurnIds.add(streamingTarget.turnId);
  }
  const initializationStreams =
    initialization?.status === 'streaming' || streamingTarget?.kind === 'initialization';
  const isStreaming = (surfaceId: string) => {
    const ownerTurnId = ownerTurnIds.get(surfaceId);
    return ownerTurnId === undefined ? initializationStreams : streamingTurnIds.has(ownerTurnId);
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
