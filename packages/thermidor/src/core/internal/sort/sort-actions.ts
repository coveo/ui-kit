import {createAction} from '@reduxjs/toolkit';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import type {CommerceSearchSort} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';

type SortActions = ReturnType<typeof createSortActions>;

const CACHE_KEY: CacheKey<SortActions> =
  createCacheKey<SortActions>('sort/actions');

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
