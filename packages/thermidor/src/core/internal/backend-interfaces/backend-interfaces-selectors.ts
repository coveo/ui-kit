import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialBackendInterfacesState} from './backend-interfaces-slice.js';
import type {
  BackendInterfaceEntry,
  BackendSuggestionsEntry,
} from './backend-interfaces-actions.js';

export function createBackendInterfacesSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'backendInterfaces',
    initialBackendInterfacesState
  );

  return {
    getInterfaces: createMemoizedStateSelector(
      sliceSelector,
      (state): Record<string, BackendInterfaceEntry> => state.interfaces
    ),
    getInterface: (targetId: string) =>
      createMemoizedStateSelector(
        sliceSelector,
        (state): BackendInterfaceEntry | undefined => state.interfaces[targetId]
      ),
    getSuggestions: (targetId: string) =>
      createMemoizedStateSelector(
        sliceSelector,
        (state): BackendSuggestionsEntry | undefined =>
          state.suggestions[targetId]
      ),
  };
}

const selectorsCache = new Map<
  string,
  ReturnType<typeof createBackendInterfacesSelectors>
>();
export function getOrCreateBackendInterfacesSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(
      interfaceId,
      createBackendInterfacesSelectors(interfaceId)
    );
  }
  return selectorsCache.get(interfaceId)!;
}
