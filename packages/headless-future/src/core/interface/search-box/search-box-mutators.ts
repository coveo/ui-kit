import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';

export const setQuery = (query: string): StateMutation => {
  return searchBoxSlice.actions.setQuery(query);
};
