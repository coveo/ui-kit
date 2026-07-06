import {createAction} from '@reduxjs/toolkit';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search/search-types.js';

type ResultsActions = ReturnType<typeof createResultsActions>;

const CACHE_KEY: CacheKey<ResultsActions> =
  createCacheKey<ResultsActions>('resultList/actions');

export function createResultsActions(interfaceId: string) {
  return {
    setResultsFromResponse: createAction<CoveoSearchResult[]>(
      `${interfaceId}/results/setResultsFromResponse`
    ),
  };
}

export function getOrCreateResultsActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createResultsActions(stateId)
  );
}
