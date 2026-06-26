import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {initialResultListState} from './result-list-slice.js';

export function createResultsSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'results',
    initialResultListState
  );
  return {
    getResults: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.results
    ),
  };
}

export const getOrCreateResultsSelectors = SingletonFactory(
  createResultsSelectors
);
