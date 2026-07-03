import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialSearchBoxState} from './search-box-slice.js';

type SearchBoxSelectors = ReturnType<typeof createSearchBoxSelectors>;

const CACHE_KEY: CacheKey<SearchBoxSelectors> =
  createCacheKey<SearchBoxSelectors>('searchBox/selectors');

export function createSearchBoxSelectors(interfaceId: string) {
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

export function getOrCreateSearchBoxSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createSearchBoxSelectors(stateId)
  );
}
