import * as searchBoxActions from '@/src/core/internal/search-box/search-box-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';

export const setQuery = (query: string): StateMutation => {
  return searchBoxActions.setQuery(query);
};
