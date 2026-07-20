import {createSlice} from '@reduxjs/toolkit';
import {
  getOrCreateBackendSurfacesActions,
  type BackendSurfaceEntry,
  type BackendSuggestionsEntry,
  type BackendFacetSearchEntry,
} from './backend-surfaces-actions.js';

export interface BackendSurfacesState {
  surfaces: Record<string, BackendSurfaceEntry>;
  suggestions: Record<string, BackendSuggestionsEntry>;
  facetSearchResults: Record<string, BackendFacetSearchEntry>;
}

export const initialBackendSurfacesState: BackendSurfacesState = {
  surfaces: {},
  suggestions: {},
  facetSearchResults: {},
};

function applyDataModelPatch(
  state: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  if (path === '/' || path === '') {
    return (value ?? {}) as Record<string, unknown>;
  }

  const key = path.replace(/^\//, '');
  state[key] = value;
  return state;
}

export function createBackendSurfacesSlice(interfaceId: string) {
  const actions = getOrCreateBackendSurfacesActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/backendSurfaces`,
    initialState: initialBackendSurfacesState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(actions.createSurface, (state, {payload}) => {
          if (payload.display === 'main') {
            for (const entry of Object.values(state.surfaces)) {
              if (entry.display === 'main') {
                entry.display = 'inline';
              }
            }
          }
          state.surfaces[payload.surfaceId] = {
            type: payload.type,
            display: payload.display,
            state: payload.state,
            turnId: payload.turnId,
          };
        })
        .addCase(actions.updateSurfaceState, (state, {payload}) => {
          const entry = state.surfaces[payload.surfaceId];
          if (entry) {
            entry.state = applyDataModelPatch(
              entry.state,
              payload.path,
              payload.value
            );
          } else {
            state.surfaces[payload.surfaceId] = {
              type: 'product_search',
              display: 'main',
              state: applyDataModelPatch({}, payload.path, payload.value),
            };
          }
          state.facetSearchResults = {};
        })
        .addCase(actions.deleteSurface, (state, {payload}) => {
          delete state.surfaces[payload.surfaceId];
        })
        .addCase(actions.setSuggestions, (state, {payload}) => {
          state.suggestions[payload.surfaceId] = payload.suggestions;
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
  ReturnType<typeof createBackendSurfacesSlice>
>();
export function getOrCreateBackendSurfacesSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createBackendSurfacesSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
