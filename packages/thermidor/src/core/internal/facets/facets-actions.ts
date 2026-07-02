import {createAction} from '@reduxjs/toolkit';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search/search-types.js';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

type FacetsActions = ReturnType<typeof createFacetsActions>;

const CACHE_KEY: CacheKey<FacetsActions> =
  createCacheKey<FacetsActions>('facets/actions');

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

export function getOrCreateFacetsActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createFacetsActions(stateId)
  );
}
