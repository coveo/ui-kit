import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
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
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createSearchBoxSelectors(stateId)
  );
}
