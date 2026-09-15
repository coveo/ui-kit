import type {Activity} from '@/src/internal/features/generative/index.js';

const COMMERCE_SEARCH_ROOT_TYPE = 'commerce-search';

/**
 * Internal helper: scans a turn's activities for the first A2-UI `createSurface`
 * message whose root component is a commerce-search surface and returns its
 * `surfaceId`.
 *
 * The root is resolved from `createSurface.rootId` against the raw v1.0 payload
 * (as authored by the producer): the node in `createSurface.components` whose
 * `id` equals `rootId` supplies `props.componentType`. A surface is treated as
 * commerce-search when that `componentType` equals `'commerce-search'`.
 *
 * Returns null when no such surface exists (e.g. a plain-text conversational
 * response, a surface with a different root componentType, or a payload missing
 * the rootId/components/props/componentType chain).
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
      const surfaceId = getCommerceSearchSurfaceId(message);
      if (surfaceId !== null) {
        return surfaceId;
      }
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getCommerceSearchSurfaceId(message: unknown): string | null {
  if (!isRecord(message)) {
    return null;
  }

  const createSurface = message['createSurface'];
  if (!isRecord(createSurface)) {
    return null;
  }

  const surfaceId = createSurface['surfaceId'];
  const rootId = createSurface['rootId'];
  if (typeof surfaceId !== 'string' || typeof rootId !== 'string') {
    return null;
  }

  const components = createSurface['components'];
  if (!Array.isArray(components)) {
    return null;
  }

  const rootComponent = components.find((comp) => isRecord(comp) && comp['id'] === rootId);
  if (!isRecord(rootComponent)) {
    return null;
  }

  const props = rootComponent['props'];
  if (!isRecord(props) || props['componentType'] !== COMMERCE_SEARCH_ROOT_TYPE) {
    return null;
  }

  return surfaceId;
}
