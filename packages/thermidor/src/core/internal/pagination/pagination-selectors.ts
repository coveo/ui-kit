import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialPaginationState} from './pagination-slice.js';

type PaginationSelectors = ReturnType<typeof createPaginationSelectors>;

const CACHE_KEY: CacheKey<PaginationSelectors> =
  createCacheKey<PaginationSelectors>('pagination/selectors');

export function createPaginationSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'pagination',
    initialPaginationState
  );
  return {
    getFirstResult: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.firstResult
    ),
    getPageSize: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.pageSize
    ),
    getTotalCount: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.totalCount
    ),
    getPage: createMemoizedStateSelector(sliceSelector, (state) =>
      state.pageSize > 0 ? Math.floor(state.firstResult / state.pageSize) : 0
    ),
  };
}

export function getOrCreatePaginationSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createPaginationSelectors(stateId)
  );
}
