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

/** Derives the session's live surfaces from `turns`, and narrows each turn's to its own. */
export function deriveSessionSurfaces(turns: readonly Turn[]): SessionSurfaceView {
  const surfaces = deriveSurfaces(sessionActivities(turns));

  // Follows the surface lifecycle as the node registry does, so a surface the projection leaves
  // out (no catalog, no root) still has the turn that created it.
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
