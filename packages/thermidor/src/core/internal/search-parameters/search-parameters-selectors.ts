import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialSearchParametersState} from './search-parameters-slice.js';

type SearchParametersSelectors = ReturnType<
  typeof createSearchParametersSelectors
>;

const CACHE_KEY: CacheKey<SearchParametersSelectors> =
  createCacheKey<SearchParametersSelectors>('searchParameters/selectors');

export function createSearchParametersSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'searchParameters',
    initialSearchParametersState
  );
  return {
    getPipeline: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.pipeline
    ),
    getConstantQuery: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.cq
    ),
  };
}

export function getOrCreateSearchParametersSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createSearchParametersSelectors(stateId)
  );
}
