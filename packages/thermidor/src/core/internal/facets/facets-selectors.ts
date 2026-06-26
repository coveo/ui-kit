import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {initialFacetsState} from './facets-slice.js';
import type {FacetsState} from '@/src/core/interface/facets/facets-types.js';

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

export const getOrCreateFacetsSelectors = SingletonFactory(
  createFacetsSelectors
);
