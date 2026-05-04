/**
 * Results Feature Slice (Redux Implementation)
 *
 * This file contains Redux-specific implementation for the results feature.
 * It is INTERNAL to Layer 0 and must NEVER be exported from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {ResultsState} from '@/src/core/interface/results/results-types.js';
import type {SearchResult} from '@/src/core/interface/result/result-types.js';

/**
 * Initial results state
 */
export const initialResultsState: ResultsState = {
  results: [],
  isLoading: false,
  error: null,
};

/**
 * Results slice manages search results, loading state, and errors
 */
export const resultsSlice = createSlice({
  name: 'results',
  initialState: initialResultsState,
  reducers: {
    setResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.results = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
      state.error = null;
    },
  },
  selectors: {
    results: (state) => state.results,
    isLoading: (state) => state.isLoading,
    error: (state) => state.error,
    hasSearchResults: (state) => state.results.length > 0,
  },
});
