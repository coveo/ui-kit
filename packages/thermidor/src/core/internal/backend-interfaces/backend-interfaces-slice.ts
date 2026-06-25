import {createSlice} from '@reduxjs/toolkit';
import {
  getOrCreateBackendInterfacesActions,
  type BackendInterfaceEntry,
  type BackendSuggestionsEntry,
} from './backend-interfaces-actions.js';

export interface BackendInterfacesState {
  interfaces: Record<string, BackendInterfaceEntry>;
  suggestions: Record<string, BackendSuggestionsEntry>;
}

export const initialBackendInterfacesState: BackendInterfacesState = {
  interfaces: {},
  suggestions: {},
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
          state.interfaces[payload.interfaceId] = {
            type: payload.type,
            display: payload.display,
            state: payload.state,
          };
        })
        .addCase(actions.updateInterfaceState, (state, {payload}) => {
          const entry = state.interfaces[payload.interfaceId];
          if (entry) {
            entry.state = payload.state;
            if (payload.display) {
              entry.display = payload.display;
            }
          }
        })
        .addCase(actions.setSuggestions, (state, {payload}) => {
          state.suggestions[payload.interfaceId] = payload.suggestions;
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
