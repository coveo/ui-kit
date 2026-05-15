import {searchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import type {SearchBoxState} from './search-box-types.js';

export type StateWithSearchBoxSlice = {searchBox: SearchBoxState};

export const getQuery = (state: StateWithSearchBoxSlice) => {
  return searchBoxSlice.selectors.query(state);
};
