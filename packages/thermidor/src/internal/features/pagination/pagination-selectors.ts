import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
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
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createPaginationSelectors(stateId)
  );
}
