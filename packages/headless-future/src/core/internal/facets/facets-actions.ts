import {createAction} from '@reduxjs/toolkit';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

export function createFacetsActions(interfaceId: string) {
  return {
    updateFromResponse: createAction<CoveoFacetResponse[] | undefined>(
      `${interfaceId}/facets/updateFromResponse`
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
