import type {Activity} from '@/src/internal/features/generative/index.js';

/**
 * Internal helper: scans a turn's activities for the first A2-UI `createSurface`
 * message declaring a `commerceSearch` surfaceType and returns its `surfaceId`.
 *
 * Returns null when no such surface exists (e.g. a plain-text conversational
 * response, or a surface of another type).
 *
 * NOTE: This duplicates `findSurface` / `findCommerceSurfaceId` from the
 * demo-schema-react sample. Both should be replaced by a framework-agnostic
 * utility exported from thermidor (tracked in the sample's IMPLEMENTATION.md).
 */
export function deriveCommerceSurfaceId(activities: Activity[] | undefined): string | null {
  if (!activities) {
    return null;
  }

  for (const activity of activities) {
    if (activity.kind !== 'a2ui-surface') {
      continue;
    }

    const messages = activity.payload['messages'];
    if (!Array.isArray(messages)) {
      continue;
    }

    for (const message of messages) {
      const createSurface = getCreateSurface(message);
      if (createSurface?.surfaceType === 'commerceSearch') {
        return createSurface.surfaceId;
      }
    }
  }

  return null;
}

function getCreateSurface(message: unknown): {surfaceType: string; surfaceId: string} | undefined {
  if (
    message &&
    typeof message === 'object' &&
    'createSurface' in message &&
    message.createSurface &&
    typeof message.createSurface === 'object' &&
    'surfaceType' in message.createSurface &&
    typeof message.createSurface.surfaceType === 'string' &&
    'surfaceId' in message.createSurface &&
    typeof message.createSurface.surfaceId === 'string'
  ) {
    return {
      surfaceType: message.createSurface.surfaceType,
      surfaceId: message.createSurface.surfaceId,
    };
  }

  return undefined;
}
