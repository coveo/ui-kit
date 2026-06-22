import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialSortState} from './sort-slice.js';
import type {SortState} from './sort-slice.js';

export function createSortSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'sort',
    initialSortState
  );

  return {
    getAppliedSort: createMemoizedStateSelector(
      sliceSelector,
      (state: SortState) => state.appliedSort
    ),
    getAvailableSorts: createMemoizedStateSelector(
      sliceSelector,
      (state: SortState) => state.availableSorts
    ),
    buildSortRequest: createMemoizedStateSelector(
      sliceSelector,
      (state: SortState) => {
        if (!state.appliedSort) {
          return [];
        }
        return [state.appliedSort];
      }
    ),
  };
}

const selectorsCache = new Map<
  string,
  ReturnType<typeof createSortSelectors>
>();
export function getOrCreateSortSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createSortSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
