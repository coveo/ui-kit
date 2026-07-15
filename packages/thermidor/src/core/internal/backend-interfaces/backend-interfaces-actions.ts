import {createAction} from '@reduxjs/toolkit';

export interface BackendInterfaceEntry {
  type: string;
  display: 'main' | 'inline';
  state: Record<string, unknown>;
  turnId?: string;
}

export interface BackendSuggestionsEntry {
  query: string;
  completions: Array<{expression: string; highlighted: string}>;
  products: Array<Record<string, unknown>>;
}

export interface BackendFacetSearchEntry {
  facetId: string;
  query: string;
  values: Array<{displayValue: string; rawValue: string; count: number}>;
  moreValuesAvailable: boolean;
}

export function createBackendInterfacesActions(interfaceId: string) {
  const prefix = `${interfaceId}/backendInterfaces`;
  return {
    createInterface: createAction<{
      interfaceId: string;
      type: string;
      display: 'main' | 'inline';
      state: Record<string, unknown>;
      turnId?: string;
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
    setFacetSearchResults: createAction<{
      interfaceId: string;
      results: BackendFacetSearchEntry;
    }>(`${prefix}/setFacetSearchResults`),
    clearFacetSearchResults: createAction<{
      interfaceId: string;
    }>(`${prefix}/clearFacetSearchResults`),
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
