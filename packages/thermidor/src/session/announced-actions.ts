/**
 * Announcements a producer makes in the AG-UI `metadata` of a surface snapshot, under a key of its
 * own, keyed by surface id. The latest well-formed entry for a surface wins, and an announcement
 * that does not have the expected shape is ignored.
 */

import type {Activity} from './types.js';

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
