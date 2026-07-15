import {createSlice} from '@reduxjs/toolkit';
import {
  getOrCreateBackendInterfacesActions,
  type BackendInterfaceEntry,
  type BackendSuggestionsEntry,
  type BackendFacetSearchEntry,
} from './backend-interfaces-actions.js';

export interface BackendInterfacesState {
  interfaces: Record<string, BackendInterfaceEntry>;
  suggestions: Record<string, BackendSuggestionsEntry>;
  facetSearchResults: Record<string, BackendFacetSearchEntry>;
}

export const initialBackendInterfacesState: BackendInterfacesState = {
  interfaces: {},
  suggestions: {},
  facetSearchResults: {},
};

export function createBackendInterfacesSlice(interfaceId: string) {
  const actions = getOrCreateBackendInterfacesActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/backendInterfaces`,
    initialState: initialBackendInterfacesState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(actions.createInterface, (state, {payload}) => {
          if (payload.display === 'main') {
            for (const entry of Object.values(state.interfaces)) {
              if (entry.display === 'main') {
                entry.display = 'inline';
              }
            }
          }
          state.interfaces[payload.interfaceId] = {
            type: payload.type,
            display: payload.display,
            state: payload.state,
            turnId: payload.turnId,
          };
        })
        .addCase(actions.updateInterfaceState, (state, {payload}) => {
          const entry = state.interfaces[payload.interfaceId];
          if (entry) {
            entry.state = payload.state;
            if (payload.display) {
              entry.display = payload.display;
            }
          } else {
            state.interfaces[payload.interfaceId] = {
              type: 'product_search',
              display: payload.display ?? 'main',
              state: payload.state,
            };
          }
          state.facetSearchResults = {};
        })
        .addCase(actions.setSuggestions, (state, {payload}) => {
          state.suggestions[payload.interfaceId] = payload.suggestions;
        })
        .addCase(actions.setFacetSearchResults, (state, {payload}) => {
          state.facetSearchResults[payload.results.facetId] = payload.results;
        })
        .addCase(actions.clearFacetSearchResults, (state) => {
          state.facetSearchResults = {};
        });
    },
  });
}

const sliceCache = new Map<
  string,
  ReturnType<typeof createBackendInterfacesSlice>
>();
export function getOrCreateBackendInterfacesSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createBackendInterfacesSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
