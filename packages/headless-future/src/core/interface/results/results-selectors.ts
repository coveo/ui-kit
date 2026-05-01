/**
 * Results Feature Selectors
 *
 * Provides library-agnostic selectors for reading results state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {resultsSlice} from '@/src/core/internal/results/results-slice.js';
import type {ResultsState} from './results-types.js';

export type StateWithResultsSlice = {results: ResultsState};

export const results = (state: StateWithResultsSlice) => {
  return resultsSlice.selectors.results(state);
};
export const isLoading = (state: StateWithResultsSlice) => {
  return resultsSlice.selectors.isLoading(state);
};
export const error = (state: StateWithResultsSlice) => {
  return resultsSlice.selectors.error(state);
};
export const hasSearchResults = (state: StateWithResultsSlice) => {
  return resultsSlice.selectors.hasSearchResults(state);
};
