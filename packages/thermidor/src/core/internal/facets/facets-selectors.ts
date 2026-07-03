import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialFacetsState} from './facets-slice.js';
import type {FacetsState} from '@/src/core/interface/facets/facets-types.js';

type FacetsSelectors = ReturnType<typeof createFacetsSelectors>;

const CACHE_KEY: CacheKey<FacetsSelectors> =
  createCacheKey<FacetsSelectors>('facets/selectors');

export function createFacetsSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'facets',
    initialFacetsState
  );
  return {
    buildFacetsRequest: createMemoizedStateSelector(
      sliceSelector,
      (state: FacetsState) => {
        return Object.entries(state).map(([facetId, facet]) => ({
          facetId,
          selectedValues: facet.selectedValues,
        }));
      }
    ),
  };
}

export function getOrCreateFacetsSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createFacetsSelectors(stateId)
  );
}
