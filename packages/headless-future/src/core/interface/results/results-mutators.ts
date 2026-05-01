/**
 * Results Feature Mutations
 *
 * Provides library-agnostic mutation API for results state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the results slice is not loaded, mutations will have no effect.
 */

import {resultsSlice} from '@/src/core/internal/results/results-slice.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import type {SearchResult} from './results-types.js';

/**
 * Results mutations
 */

export const setResults = (engine: Engine, results: SearchResult[]) => {
  engine.mutate(resultsSlice.actions.setResults(results));
};

export const setLoading = (engine: Engine, isLoading: boolean) => {
  engine.mutate(resultsSlice.actions.setLoading(isLoading));
};

export const setError = (engine: Engine, error: string | null) => {
  engine.mutate(resultsSlice.actions.setError(error));
};

export const clearResults = (engine: Engine) => {
  engine.mutate(resultsSlice.actions.clearResults());
};
