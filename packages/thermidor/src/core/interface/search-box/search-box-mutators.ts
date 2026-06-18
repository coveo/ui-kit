import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';

export const setQuery = (
  query: string,
  interfaceId: string = 'default'
): StateMutation => {
  const actions = getOrCreateSearchBoxActions(interfaceId);
  return actions.setQuery(query);
};
