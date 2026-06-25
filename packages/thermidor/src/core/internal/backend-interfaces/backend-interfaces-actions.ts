import {createAction} from '@reduxjs/toolkit';

export interface BackendInterfaceEntry {
  type: string;
  display: 'main' | 'inline';
  state: Record<string, unknown>;
}

export interface BackendSuggestionsEntry {
  query: string;
  completions: Array<{expression: string; highlighted: string}>;
  products: Array<Record<string, unknown>>;
}

export function createBackendInterfacesActions(interfaceId: string) {
  const prefix = `${interfaceId}/backendInterfaces`;
  return {
    createInterface: createAction<{
      interfaceId: string;
      type: string;
      display: 'main' | 'inline';
      state: Record<string, unknown>;
    }>(`${prefix}/createInterface`),
    updateInterfaceState: createAction<{
      interfaceId: string;
      state: Record<string, unknown>;
      display?: 'main' | 'inline';
    }>(`${prefix}/updateInterfaceState`),
    setSuggestions: createAction<{
      interfaceId: string;
      suggestions: BackendSuggestionsEntry;
    }>(`${prefix}/setSuggestions`),
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createBackendInterfacesActions>
>();
export function getOrCreateBackendInterfacesActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createBackendInterfacesActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
