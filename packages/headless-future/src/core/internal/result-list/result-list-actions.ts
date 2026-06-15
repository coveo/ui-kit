import {createAction} from '@reduxjs/toolkit';
import type {SearchResult} from '@/src/core/interface/result-list/result-list-types.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

export function createResultsActions(interfaceId: string) {
  return {
    setResultsFromResponse: createAction<CoveoSearchResult[]>(
      `${interfaceId}/results/setResultsFromResponse`
    ),
  };
}

const actionsCache = new Map<string, ReturnType<typeof createResultsActions>>();
export function getOrCreateResultsActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createResultsActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}

/**
 * @deprecated Use `getOrCreateResultsActions(interfaceId)` instead.
 */
export const setResults = createAction<SearchResult[]>('results/setResults');

/**
 * @deprecated Use scoped factories instead.
 */
export const clearResults = createAction('results/clearResults');

/**
 * @deprecated Use `getOrCreateResultsActions(interfaceId).setResultsFromResponse` instead.
 */
export const setResultsFromResponse = createAction<CoveoSearchResult[]>(
  'results/setResultsFromResponse'
);
