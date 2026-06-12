import {State} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {FacetState, FacetsState} from './facets-types.js';
import {initialFacetsState} from '@/src/core/internal/facets/facets-slice.js';
import type {CoveoFacetRequest} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

const getFacetsState = (state: State) => state.facets ?? initialFacetsState;

export const all = createMemoizedStateSelector(
  getFacetsState,
  (facets): FacetsState => facets
);

export const byId = (facetId: string) =>
  createMemoizedStateSelector(
    getFacetsState,
    (facets): FacetState | undefined => facets[facetId]
  );

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
