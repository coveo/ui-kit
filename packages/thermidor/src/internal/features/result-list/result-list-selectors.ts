import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
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
