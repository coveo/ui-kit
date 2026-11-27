/**
 * Turn-opening actions announced by the producer (ADR-019).
 *
 * A producer announces, in the AG-UI `metadata` of a surface snapshot, the actions of each surface
 * whose answer it gives as a new turn of the conversation:
 *
 * ```json
 * {"metadata": {"turnOpeningActions": {"<surfaceId>": ["selectAction"]}}}
 * ```
 *
 * The session reads it when an action is dispatched, so the turn opens as soon as the shopper picks
 * the action. The latest announcement for a surface wins, and an empty list revokes it. `metadata`
 * is untyped in AG-UI, so an announcement that does not have this shape is ignored.
 */

import {latestAnnouncement, readActionNames} from './announced-actions.js';
import type {Activity} from './types.js';

/**
 * Whether the producer announced that the action `name`, dispatched from `surfaceId`, opens a turn,
 * reading the session's activity log in order.
 */
export function isTurnOpeningAction(
  activities: readonly Activity[],
  surfaceId: string,
  name: string
): boolean {
  return (
    latestAnnouncement(activities, 'turnOpeningActions', surfaceId, readActionNames)?.includes(
      name
    ) ?? false
  );
}
