import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {CoveoSearchResult} from '@/src/internal/api/search/index.js';

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
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createResultsActions(stateId)
  );
}
