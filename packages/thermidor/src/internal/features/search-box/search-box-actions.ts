import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

type SearchBoxActions = ReturnType<typeof createSearchBoxActions>;

const CACHE_KEY: CacheKey<SearchBoxActions> = createCacheKey<SearchBoxActions>('searchBox/actions');

export function createSearchBoxActions(interfaceId: string) {
  return {
    setQuery: createAction<string>(`${interfaceId}/searchBox/setQuery`),
  };
}

export function getOrCreateSearchBoxActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createSearchBoxActions(stateId));
}
