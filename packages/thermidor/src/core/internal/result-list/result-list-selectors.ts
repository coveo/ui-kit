import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialResultListState} from './result-list-slice.js';

function createResultsSelectors(interfaceId: string) {
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

const selectorsCache = new Map<
  string,
  ReturnType<typeof createResultsSelectors>
>();
export function getOrCreateResultsSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createResultsSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
