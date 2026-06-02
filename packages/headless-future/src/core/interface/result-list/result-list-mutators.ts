import * as resultListActions from '@/src/core/internal/result-list/result-list-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {SearchResult} from './result-list-types.js';

export const setResults = (results: SearchResult[]): StateMutation => {
  return resultListActions.setResults(results);
};

export const clearResults = (): StateMutation => {
  return resultListActions.clearResults();
};
