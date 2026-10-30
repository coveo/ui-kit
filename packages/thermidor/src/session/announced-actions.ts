/**
 * Concurrent and cached actions announced by the producer (ADR-020).
 *
 * A producer announces, in the AG-UI `metadata` of a surface snapshot, the actions of each surface
 * it answers beside the turn, and how long it allows an answer to be reused:
 *
 * ```json
 * {
 *   "metadata": {
 *     "concurrentActions": {"<surfaceId>": ["fetchInstantProducts"]},
 *     "cachedActions": {"<surfaceId>": {"fetchInstantProducts": {"ttlMs": 60000}}}
 *   }
 * }
 * ```
 *
 * They are read as turn-opening actions are (ADR-019): the latest announcement for a surface wins,
 * an empty entry revokes it, and an announcement that does not have this shape is ignored. Only a
 * concurrent action is cached, so a cached answer never races the session's single request.
 */

import type {Activity} from './types.js';

/** How long the answer to a cached action is reused. */
export interface CachePolicy {
  ttlMs: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The latest well-formed entry for `surfaceId` under the metadata `key`, reading the session's
 * activity log in order.
 */
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

function isCachePolicy(policy: unknown): policy is CachePolicy {
  return (
    isRecord(policy) &&
    typeof policy['ttlMs'] === 'number' &&
    Number.isFinite(policy['ttlMs']) &&
    policy['ttlMs'] > 0
  );
}

function readCachePolicies(entry: unknown): Readonly<Record<string, CachePolicy>> | undefined {
  return isRecord(entry) && Object.values(entry).every(isCachePolicy)
    ? (entry as Record<string, CachePolicy>)
    : undefined;
}

/**
 * Whether the producer announced that the action `name`, dispatched from `surfaceId`, is sent
 * concurrently, beside the session's single request.
 */
export function isConcurrentAction(
  activities: readonly Activity[],
  surfaceId: string,
  name: string
): boolean {
  return (
    latestAnnouncement(activities, 'concurrentActions', surfaceId, readActionNames)?.includes(
      name
    ) ?? false
  );
}

/**
 * The cache policy the producer announced for the action `name`, dispatched from `surfaceId`, or
 * `undefined` when it is not cached. An action not announced as concurrent is never cached.
 */
export function cachePolicy(
  activities: readonly Activity[],
  surfaceId: string,
  name: string
): CachePolicy | undefined {
  if (!isConcurrentAction(activities, surfaceId, name)) {
    return undefined;
  }
  const policies = latestAnnouncement(activities, 'cachedActions', surfaceId, readCachePolicies);
  return policies && Object.hasOwn(policies, name) ? policies[name] : undefined;
}
