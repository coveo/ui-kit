import {
  setResults as _setResults,
  clearResults as _clearResults,
} from '@/src/core/internal/result-list/result-list-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {SearchResult} from './result-list-types.js';

export const setResults = (results: SearchResult[]): StateMutation => {
  return _setResults(results);
};

export const clearResults = (): StateMutation => {
  return _clearResults();
};
