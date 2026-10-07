import type {A2uiV09Message, DiscoveredSurface} from '@coveo/thermidor';
import {isRecord} from '../utils.js';

/** Root `component` discriminant of a gateway commerce-search surface (ADR-015 interim). */
export const COMMERCE_SEARCH_ROOT_TYPE = 'CommerceSearch';

const SURFACE_OPERATIONS = [
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
] as const;

/** Ids of a turn's commerce-search surfaces, in creation order. */
export function commerceSurfaceIds(surfaces: readonly DiscoveredSurface[] | undefined): string[] {
  return (surfaces ?? [])
    .filter((surface) => surface.rootComponentType === COMMERCE_SEARCH_ROOT_TYPE)
    .map((surface) => surface.surfaceId);
}

/**
 * The turn's latest commerce-search surface. A turn can hold several: a search option tapped in
 * an agent answer opens a new one on the same turn, beside the agent's own surfaces.
 */
export function latestCommerceSurfaceId(
  surfaces: readonly DiscoveredSurface[] | undefined
): string | null {
  return commerceSurfaceIds(surfaces).at(-1) ?? null;
}

/**
 * Keeps the messages addressed to the surfaces `keep` accepts. A message that targets no
 * surface is kept.
 */
export function filterSurfaceMessages(
  messages: readonly A2uiV09Message[],
  keep: (surfaceId: string) => boolean
): A2uiV09Message[] {
  return messages.filter((message) => {
    const surfaceId = messageSurfaceId(message);
    return surfaceId === undefined || keep(surfaceId);
  });
}

function messageSurfaceId(message: A2uiV09Message): string | undefined {
  for (const operation of SURFACE_OPERATIONS) {
    const body = message[operation];
    if (isRecord(body) && typeof body['surfaceId'] === 'string') {
      return body['surfaceId'];
    }
  }
  return undefined;
}
