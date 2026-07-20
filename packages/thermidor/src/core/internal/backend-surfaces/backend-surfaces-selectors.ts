import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialBackendSurfacesState} from './backend-surfaces-slice.js';
import type {
  BackendSurfaceEntry,
  BackendSuggestionsEntry,
  BackendFacetSearchEntry,
} from './backend-surfaces-actions.js';

export function createBackendSurfacesSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'backendSurfaces',
    initialBackendSurfacesState
  );

  return {
    getSurfaces: createMemoizedStateSelector(
      sliceSelector,
      (state): Record<string, BackendSurfaceEntry> => state.surfaces
    ),
    getSurface: (surfaceId: string) =>
      createMemoizedStateSelector(
        sliceSelector,
        (state): BackendSurfaceEntry | undefined => state.surfaces[surfaceId]
      ),
    getSuggestions: (surfaceId: string) =>
      createMemoizedStateSelector(
        sliceSelector,
        (state): BackendSuggestionsEntry | undefined =>
          state.suggestions[surfaceId]
      ),
    getFacetSearchResults: (facetId: string) =>
      createMemoizedStateSelector(
        sliceSelector,
        (state): BackendFacetSearchEntry | undefined =>
          state.facetSearchResults[facetId]
      ),
  };
}

const selectorsCache = new Map<
  string,
  ReturnType<typeof createBackendSurfacesSelectors>
>();
export function getOrCreateBackendSurfacesSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(
      interfaceId,
      createBackendSurfacesSelectors(interfaceId)
    );
  }
  return selectorsCache.get(interfaceId)!;
}
