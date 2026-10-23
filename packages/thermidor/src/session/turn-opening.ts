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

import type {Activity} from './types.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function announcedActions(activity: Activity, surfaceId: string): readonly string[] | undefined {
  const turnOpeningActions = activity.metadata?.['turnOpeningActions'];
  if (!isRecord(turnOpeningActions) || !(surfaceId in turnOpeningActions)) {
    return undefined;
  }
  const actions = turnOpeningActions[surfaceId];
  return Array.isArray(actions) && actions.every((name) => typeof name === 'string')
    ? actions
    : undefined;
}

/**
 * Whether the producer announced that the action `name`, dispatched from `surfaceId`, opens a turn,
 * reading the session's activity log in order.
 */
export function isTurnOpeningAction(
  activities: readonly Activity[],
  surfaceId: string,
  name: string
): boolean {
  let announced: readonly string[] | undefined;
  for (const activity of activities) {
    announced = announcedActions(activity, surfaceId) ?? announced;
  }
  return announced?.includes(name) ?? false;
}
