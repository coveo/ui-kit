import {getOrCreateResultsActions} from '@/src/core/internal/result-list/result-list-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import type {CoveoSearchResult} from '@/src/core/interface/api/search/search-types.js';

export const setResultsFromResponse = (
  results: CoveoSearchResult[],
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreateResultsActions(iface);
  return actions.setResultsFromResponse(results);
};
