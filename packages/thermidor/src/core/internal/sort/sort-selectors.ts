import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialSortState} from './sort-slice.js';
import type {SortState} from './sort-slice.js';

type SortSelectors = ReturnType<typeof createSortSelectors>;

const CACHE_KEY: CacheKey<SortSelectors> =
  createCacheKey<SortSelectors>('sort/selectors');

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

export function getOrCreateSortSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createSortSelectors(stateId)
  );
}
