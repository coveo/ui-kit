import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
import {initialFacetsState} from './facets-slice.js';
import type {FacetState, FacetsState} from './facets-types.js';
import type {State} from '@/src/internal/engine/index.js';
import type {CoveoFacetRequest} from '@/src/internal/api/search/index.js';

// ---------------------------------------------------------------------------
// Standalone selectors (formerly core/interface/facets/facets-selectors.ts)
// ---------------------------------------------------------------------------

const getFacetsState = (state: State) => state.facets ?? initialFacetsState;

export const all = createMemoizedStateSelector(getFacetsState, (facets): FacetsState => facets);

export const byId = (facetId: string) =>
  createMemoizedStateSelector(getFacetsState, (facets): FacetState | undefined => facets[facetId]);

export const selectedValues = (facetId: string) =>
  createMemoizedStateSelector(
    getFacetsState,
    (facets): string[] => facets[facetId]?.selectedValues ?? []
  );

export const allSelectedValues = createMemoizedStateSelector(
  getFacetsState,
  (facets): Array<{facetId: string; valueId: string}> =>
    Object.entries(facets).flatMap(([facetId, facet]) =>
      facet.selectedValues.map((valueId) => ({facetId, valueId}))
    )
);

export const buildFacetsRequest = createMemoizedStateSelector(
  all,
  (facets): CoveoFacetRequest[] | undefined => {
    const entries = Object.values(facets);

    if (entries.length === 0) {
      return undefined;
    }

    return entries.map((facet) => ({
      facetId: facet.id,
      field: facet.id,
      currentValues: facet.selectedValues.map((value) => ({
        value,
        state: 'selected',
      })),
    }));
  }
);

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
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createFacetsSelectors(stateId));
}
