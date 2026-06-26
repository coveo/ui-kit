import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
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
    getPage: createMemoizedStateSelector(sliceSelector, (state) =>
      state.pageSize > 0 ? Math.floor(state.firstResult / state.pageSize) : 0
    ),
  };
}

export const getOrCreatePaginationSelectors = SingletonFactory(
  createPaginationSelectors
);
