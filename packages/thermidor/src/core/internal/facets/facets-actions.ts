import {createAction} from '@reduxjs/toolkit';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search/search-types.js';

export function createFacetsActions(interfaceId: string) {
  return {
    updateFromResponse: createAction<CoveoFacetResponse[] | undefined>(
      `${interfaceId}/facets/updateFromResponse`
    ),
    hydrateFromSnapshot: createAction<CoveoFacetResponse[] | undefined>(
      `${interfaceId}/facets/hydrateFromSnapshot`
    ),
  };
}

const actionsCache = new Map<string, ReturnType<typeof createFacetsActions>>();
export function getOrCreateFacetsActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createFacetsActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
