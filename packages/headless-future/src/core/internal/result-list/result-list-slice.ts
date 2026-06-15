import {createSlice} from '@reduxjs/toolkit';
import type {ResultListState} from '@/src/core/interface/result-list/result-list-types.js';
import {
  getOrCreateResultsActions,
  setResults,
  clearResults,
} from './result-list-actions.js';

export const initialResultListState: ResultListState = {
  results: [],
};

export function createResultsSlice(interfaceId: string) {
  const actions = getOrCreateResultsActions(interfaceId);
  return createSlice({
    name: `${interfaceId}/results`,
    initialState: initialResultListState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setResultsFromResponse, (state, action) => {
        state.results = action.payload.map((result) => ({
          uniqueId: result.uniqueId,
          title: result.title,
          uri: result.uri,
          excerpt: result.excerpt,
          printableUri: result.printableUri,
          clickUri: result.clickUri,
          raw: result.raw,
          score: result.score,
        }));
      });
    },
  });
}

const sliceCache = new Map<string, ReturnType<typeof createResultsSlice>>();
export function getOrCreateResultsSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createResultsSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}

/**
 * @deprecated Use `getOrCreateResultsSlice(interfaceId)` instead.
 * Kept for backward compatibility with existing consumers.
 */
export const resultsSlice = (() => {
  const {setResultsFromResponse} = getOrCreateResultsActions('default');
  return createSlice({
    name: 'results',
    initialState: initialResultListState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(setResults, (state, action) => {
        state.results = action.payload;
      });
      builder.addCase(clearResults, (state) => {
        state.results = [];
      });
      builder.addCase(setResultsFromResponse, (state, action) => {
        state.results = action.payload.map((result) => ({
          uniqueId: result.uniqueId,
          title: result.title,
          uri: result.uri,
          excerpt: result.excerpt,
          printableUri: result.printableUri,
          clickUri: result.clickUri,
          raw: result.raw,
          score: result.score,
        }));
      });
    },
    selectors: {
      results: (state) => state.results,
      hasSearchResults: (state) => state.results.length > 0,
    },
  });
})();
