import {createSlice} from '@reduxjs/toolkit';
import type {ResultListState} from '@/src/core/interface/result-list/result-list-types.js';
import * as resultListActions from './result-list-actions.js';

export const initialResultListState: ResultListState = {
  results: [],
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState: initialResultListState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resultListActions.setResults, (state, action) => {
      state.results = action.payload;
    });
    builder.addCase(resultListActions.clearResults, (state) => {
      state.results = [];
    });
    builder.addCase(
      resultListActions.setResultsFromResponse,
      (state, action) => {
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
      }
    );
  },
  selectors: {
    results: (state) => state.results,
    hasSearchResults: (state) => state.results.length > 0,
  },
});
