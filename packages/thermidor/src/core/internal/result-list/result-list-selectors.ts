import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialResultListState} from './result-list-slice.js';

type ResultsSelectors = ReturnType<typeof createResultsSelectors>;

const CACHE_KEY: CacheKey<ResultsSelectors> = createCacheKey<ResultsSelectors>(
  'resultList/selectors'
);

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

export function getOrCreateResultsSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createResultsSelectors(stateId)
  );
}
