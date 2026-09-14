import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
import {initialFacetsState} from './facets-slice.js';
import type {FacetsState} from './facets-types.js';

// ---------------------------------------------------------------------------
// Factory-based selectors (formerly core/internal/facets/facets-selectors.ts)
// ---------------------------------------------------------------------------

type FacetsSelectors = ReturnType<typeof createFacetsSelectors>;

const CACHE_KEY: CacheKey<FacetsSelectors> = createCacheKey<FacetsSelectors>('facets/selectors');

export function createFacetsSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(interfaceId, 'facets', initialFacetsState);
  return {
    buildFacetsRequest: createMemoizedStateSelector(sliceSelector, (state: FacetsState) => {
      return Object.entries(state).map(([facetId, facet]) => ({
        facetId,
        selectedValues: facet.selectedValues,
      }));
    }),
  };
}

export function getOrCreateFacetsSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createFacetsSelectors(stateId));
}
