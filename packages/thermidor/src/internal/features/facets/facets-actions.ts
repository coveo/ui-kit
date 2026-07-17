import {createAction} from '@reduxjs/toolkit';
import type {CoveoFacetResponse} from '@/src/internal/api/search/index.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

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
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createFacetsActions(stateId)
  );
}
