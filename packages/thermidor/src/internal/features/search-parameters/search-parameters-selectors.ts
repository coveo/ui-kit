import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
import {initialSearchParametersState} from './search-parameters-slice.js';

type SearchParametersSelectors = ReturnType<typeof createSearchParametersSelectors>;

const CACHE_KEY: CacheKey<SearchParametersSelectors> = createCacheKey<SearchParametersSelectors>(
  'searchParameters/selectors'
);

export function createSearchParametersSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'searchParameters',
    initialSearchParametersState
  );
  return {
    getPipeline: createMemoizedStateSelector(sliceSelector, (state) => state.pipeline),
    getConstantQuery: createMemoizedStateSelector(sliceSelector, (state) => state.cq),
  };
}

export function getOrCreateSearchParametersSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createSearchParametersSelectors(stateId));
}
