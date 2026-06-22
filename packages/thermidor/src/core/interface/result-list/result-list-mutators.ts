import {getOrCreateResultsActions} from '@/src/core/internal/result-list/result-list-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

export const setResultsFromResponse = (
  results: CoveoSearchResult[],
  interfaceId: string = 'default'
): StateMutation => {
  const actions = getOrCreateResultsActions(interfaceId);
  return actions.setResultsFromResponse(results);
};
