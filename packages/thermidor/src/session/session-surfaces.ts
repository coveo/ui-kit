/**
 * Session-scoped surfaces (ADR-018).
 *
 * The session derives its surfaces from one ordered activity log: each turn's activities, in
 * order. A surface lives from its `createSurface` until its `deleteSurface`, whichever runs carry
 * them, and a `createSurface` for a live id replaces that surface. The fold keeps per-turn
 * projections; this module derives the session-wide ones and narrows each turn's `surfaces` to
 * the live surfaces it created.
 */

import {deriveSurfaces, SURFACE_ACTIVITY_KIND} from './fold.js';
import type {Activity, DiscoveredSurface, Turn} from './types.js';

/** The session's surfaces, derived from every turn's activities. */
export interface SessionSurfaceView {
  /** The turns, each with its `surfaces` narrowed to the live surfaces it created. */
  turns: readonly Turn[];
  /** Every live surface, in creation order. */
  surfaces: readonly DiscoveredSurface[];
  /** The turn that created each surface still alive, by surface id. */
  ownerTurnIds: ReadonlyMap<string, string>;
}

/** Every turn's activities, in order: the session's activity log. */
export function sessionActivities(turns: readonly Turn[]): Activity[] {
  return turns.flatMap((turn) => turn.response.activities);
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
function deriveOwnerTurnIds(turns: readonly Turn[]): Map<string, string> {
  const ownerTurnIds = new Map<string, string>();
  for (const turn of turns) {
    for (const activity of turn.response.activities) {
      const messages =
        activity.kind === SURFACE_ACTIVITY_KIND ? activity.payload['messages'] : null;
      for (const message of Array.isArray(messages) ? messages : []) {
        const {created, deleted} = surfaceLifecycle(message);
        if (created !== undefined) {
          ownerTurnIds.set(created, turn.id);
        } else if (deleted !== undefined) {
          ownerTurnIds.delete(deleted);
        }
      }
    }
  }
  return ownerTurnIds;
}

/**
 * The loading placeholders `turnId` has already abandoned: those it created while it is not
 * streaming. Read when a request starts streaming into that turn, so they stay out of the lists
 * while it runs.
 */
export function abandonedPlaceholderIds(
  turns: readonly Turn[],
  turnId: string
): ReadonlySet<string> {
  const turn = turns.find((candidate) => candidate.id === turnId);
  if (!turn || turn.status === 'streaming') {
    return new Set();
  }
  const ownerTurnIds = deriveOwnerTurnIds(turns);
  return new Set(
    deriveSurfaces(sessionActivities(turns))
      .filter((surface) => surface.isLoading && ownerTurnIds.get(surface.surfaceId) === turnId)
      .map((surface) => surface.surfaceId)
  );
}

/**
 * Derives the session's live surfaces from `turns`, and narrows each turn's to its own. A loading
 * placeholder is listed only while the run that created it streams: while its turn is
 * `streaming`, or while the request in flight, `streamingTurnId`, streams into it, unless it was
 * already abandoned when that request started (`abandonedIds`). One the agent left behind once
 * its run ended (a cancelled run, an error, a restored session) is abandoned and leaves the lists.
 */
export function deriveSessionSurfaces(
  turns: readonly Turn[],
  streamingTurnId?: string,
  abandonedIds: ReadonlySet<string> = new Set()
): SessionSurfaceView {
  const ownerTurnIds = deriveOwnerTurnIds(turns);

  const streamingTurnIds = new Set(
    turns.filter((turn) => turn.status === 'streaming').map((turn) => turn.id)
  );
  if (streamingTurnId !== undefined) {
    streamingTurnIds.add(streamingTurnId);
  }
  const surfaces = deriveSurfaces(sessionActivities(turns)).filter(
    (surface) =>
      !surface.isLoading ||
      (streamingTurnIds.has(ownerTurnIds.get(surface.surfaceId) ?? '') &&
        !abandonedIds.has(surface.surfaceId))
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
