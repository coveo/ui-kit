/**
 * Concurrent actions announced by the producer (ADR-020).
 *
 * A producer announces, in the AG-UI `metadata` of a surface snapshot, the actions of each surface
 * it answers beside the turn, each with how long it allows an answer to be reused, if at all:
 *
 * ```json
 * {
 *   "metadata": {
 *     "concurrentActions": {"<surfaceId>": {"fetchInstantProducts": {"cache": {"ttlMs": 60000}}}}
 *   }
 * }
 * ```
 *
 * They are read as turn-opening actions are (ADR-019): the latest announcement for a surface wins,
 * an empty entry revokes it, and an announcement that does not have this shape is ignored.
 */

import type {Activity} from './types.js';

export interface CachePolicy {
  ttlMs: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The latest well-formed entry for `surfaceId` under the metadata `key`. */
export function latestAnnouncement<T>(
  activities: readonly Activity[],
  key: string,
  surfaceId: string,
  read: (entry: unknown) => T | undefined
): T | undefined {
  let announced: T | undefined;
  for (const activity of activities) {
    const announcements = activity.metadata?.[key];
    if (isRecord(announcements) && surfaceId in announcements) {
      announced = read(announcements[surfaceId]) ?? announced;
    }
  }
  return announced;
}

export function readActionNames(entry: unknown): readonly string[] | undefined {
  return Array.isArray(entry) && entry.every((name) => typeof name === 'string')
    ? entry
    : undefined;
}

export interface ConcurrentAction {
  /** Absent when the action is not cached. */
  cache?: CachePolicy;
}

function isCachePolicy(policy: unknown): policy is CachePolicy {
  return (
    isRecord(policy) &&
    typeof policy['ttlMs'] === 'number' &&
    Number.isFinite(policy['ttlMs']) &&
    policy['ttlMs'] > 0
  );
}

function isConcurrentActionEntry(action: unknown): action is ConcurrentAction {
  return isRecord(action) && (action['cache'] === undefined || isCachePolicy(action['cache']));
}

function readConcurrentActions(
  entry: unknown
): Readonly<Record<string, ConcurrentAction>> | undefined {
  return isRecord(entry) && Object.values(entry).every(isConcurrentActionEntry)
    ? (entry as Record<string, ConcurrentAction>)
    : undefined;
}

/** `undefined` when the action is not concurrent. */
export function concurrentAction(
  activities: readonly Activity[],
  surfaceId: string,
  name: string
): ConcurrentAction | undefined {
  const actions = latestAnnouncement(
    activities,
    'concurrentActions',
    surfaceId,
    readConcurrentActions
  );
  return actions && Object.hasOwn(actions, name) ? actions[name] : undefined;
}
