import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialPaginationState} from './pagination-slice.js';

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
  };
}

const selectorsCache = new Map<
  string,
  ReturnType<typeof createPaginationSelectors>
>();
export function getOrCreatePaginationSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createPaginationSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
