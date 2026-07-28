import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {CommerceSearchSort} from '@/src/internal/api/commerce-search/index.js';

type SortActions = ReturnType<typeof createSortActions>;

const CACHE_KEY: CacheKey<SortActions> = createCacheKey<SortActions>('sort/actions');

export function createSortActions(interfaceId: string) {
  return {
    updateFromResponse: createAction<CommerceSearchSort | undefined>(
      `${interfaceId}/sort/updateFromResponse`
    ),
  };
}

export function getOrCreateSortActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createSortActions(stateId));
}
