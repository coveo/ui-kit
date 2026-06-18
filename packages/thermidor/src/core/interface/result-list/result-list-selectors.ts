/**
 * Results Feature Selectors
 *
 * Provides library-agnostic selectors for reading results state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import type {ResultListState} from './result-list-types.js';

export type StateWithResultsSlice = {results: ResultListState};

export const results = (state: StateWithResultsSlice) => {
  return resultsSlice.selectors.results(state);
};
export const hasSearchResults = (state: StateWithResultsSlice) => {
  return resultsSlice.selectors.hasSearchResults(state);
};
