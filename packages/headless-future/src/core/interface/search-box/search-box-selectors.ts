import {
  searchBoxSlice,
  SearchBoxState,
} from '@/src/core/internal/search-box/search-box-slice.js';

export type StateWithSearchBoxSlice = {searchBox: SearchBoxState};

export const getQuery = (state: StateWithSearchBoxSlice) => {
  return searchBoxSlice.selectors.query(state);
};
