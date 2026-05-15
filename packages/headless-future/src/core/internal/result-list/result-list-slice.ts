import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  ResultListState,
  SearchResult,
} from '@/src/core/interface/result-list/result-list-types.js';

export const initialResultListState: ResultListState = {
  results: [],
};

export const resultsSlice = createSlice({
  name: 'results',
  initialState: initialResultListState,
  reducers: {
    setResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.results = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
    },
  },
  selectors: {
    results: (state) => state.results,
    hasSearchResults: (state) => state.results.length > 0,
  },
});
