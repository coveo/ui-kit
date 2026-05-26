import {resultsSlice} from '@/src/core/internal/result-list/result-list-slice.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {SearchResult} from './result-list-types.js';

export const setResults = (results: SearchResult[]): StateMutation => {
  return resultsSlice.actions.setResults(results);
};

export const clearResults = (): StateMutation => {
  return resultsSlice.actions.clearResults();
};
