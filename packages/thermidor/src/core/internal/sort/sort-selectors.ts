import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
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

export const getOrCreateSortSelectors = SingletonFactory(createSortSelectors);
