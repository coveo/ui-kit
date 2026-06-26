import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialSearchBoxState} from './search-box-slice.js';

function createSearchBoxSelectors(interfaceId: string) {
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

const selectorsCache = new Map<
  string,
  ReturnType<typeof createSearchBoxSelectors>
>();
export function getOrCreateSearchBoxSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createSearchBoxSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
