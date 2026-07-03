import {createAction} from '@reduxjs/toolkit';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

type SearchBoxActions = ReturnType<typeof createSearchBoxActions>;

const CACHE_KEY: CacheKey<SearchBoxActions> =
  createCacheKey<SearchBoxActions>('searchBox/actions');

export function createSearchBoxActions(interfaceId: string) {
  return {
    setQuery: createAction<string>(`${interfaceId}/searchBox/setQuery`),
  };
}

export function getOrCreateSearchBoxActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createSearchBoxActions(stateId)
  );
}
