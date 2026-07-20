import {createAction} from '@reduxjs/toolkit';

export interface BackendSurfaceEntry {
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

export function createBackendSurfacesActions(interfaceId: string) {
  const prefix = `${interfaceId}/backendSurfaces`;
  return {
    createSurface: createAction<{
      surfaceId: string;
      type: string;
      display: 'main' | 'inline';
      state: Record<string, unknown>;
      turnId?: string;
    }>(`${prefix}/createSurface`),
    updateSurfaceState: createAction<{
      surfaceId: string;
      path: string;
      value: unknown;
    }>(`${prefix}/updateSurfaceState`),
    deleteSurface: createAction<{
      surfaceId: string;
    }>(`${prefix}/deleteSurface`),
    setSuggestions: createAction<{
      surfaceId: string;
      suggestions: BackendSuggestionsEntry;
    }>(`${prefix}/setSuggestions`),
    setFacetSearchResults: createAction<{
      surfaceId: string;
      results: BackendFacetSearchEntry;
    }>(`${prefix}/setFacetSearchResults`),
    clearFacetSearchResults: createAction<{
      surfaceId: string;
    }>(`${prefix}/clearFacetSearchResults`),
  };
}

const actionsCache = new Map<
  string,
  ReturnType<typeof createBackendSurfacesActions>
>();
export function getOrCreateBackendSurfacesActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createBackendSurfacesActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
