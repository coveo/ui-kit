import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

type SearchParametersActions = ReturnType<typeof createSearchParametersActions>;

const CACHE_KEY: CacheKey<SearchParametersActions> =
  createCacheKey<SearchParametersActions>('searchParameters/actions');

export function createSearchParametersActions(interfaceId: string) {
  return {
    setPipeline: createAction<string>(
      `${interfaceId}/searchParameters/setPipeline`
    ),
    setConstantQuery: createAction<string>(
      `${interfaceId}/searchParameters/setConstantQuery`
    ),
  };
}

export function getOrCreateSearchParametersActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createSearchParametersActions(stateId)
  );
}
