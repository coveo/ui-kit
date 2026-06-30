import {createAction} from '@reduxjs/toolkit';
import type {CoveoSearchResult} from '@/src/core/interface/api/search/search-types.js';

function createResultsActions(interfaceId: string) {
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
