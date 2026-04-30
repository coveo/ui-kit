/**
 * Results Feature Mutations
 *
 * Provides library-agnostic mutation API for results state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the results slice is not loaded, mutations will have no effect.
 */

import {resultsSlice} from '@/src/core/internal/results/slice.js';
import type {StateMutation} from '@/src/core/interface/types.js';
import type {SearchResult} from './types.js';

/**
 * Results mutations
 */

export const setResults = (results: SearchResult[]): StateMutation => {
  return resultsSlice.actions.setResults(results);
};

export const setLoading = (isLoading: boolean): StateMutation => {
  return resultsSlice.actions.setLoading(isLoading);
};

export const setError = (error: string | null): StateMutation => {
  return resultsSlice.actions.setError(error);
};

export const clearResults = (): StateMutation => {
  return resultsSlice.actions.clearResults();
};
