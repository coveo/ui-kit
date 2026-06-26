import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {initialSearchBoxState} from './search-box-slice.js';

export function createSearchBoxSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'searchBox',
    initialSearchBoxState
  );
  return {
    getQuery: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.query
    ),
  };
}

export const getOrCreateSearchBoxSelectors = SingletonFactory(
  createSearchBoxSelectors
);
