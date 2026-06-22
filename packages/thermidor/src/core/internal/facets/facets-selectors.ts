import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
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

const selectorsCache = new Map<
  string,
  ReturnType<typeof createFacetsSelectors>
>();
export function getOrCreateFacetsSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createFacetsSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
