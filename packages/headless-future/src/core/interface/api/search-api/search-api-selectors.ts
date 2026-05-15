import {searchApiSlice} from '@/src/core/internal/api/search-api/search-api-slice.js';
import {SearchApiState} from './search-api-types.js';

type StateWithSearchApiSlice = {searchApi: SearchApiState};

export const status = (state: StateWithSearchApiSlice) => {
  return state.searchApi.status;
};

export const isLoading = (state: StateWithSearchApiSlice) => {
  return state.searchApi.status === 'pending';
};

export const error = (state: StateWithSearchApiSlice) => {
  return searchApiSlice.selectors.error(state);
};

export const configuration = (state: StateWithSearchApiSlice) => {
  return searchApiSlice.selectors.configuration(state);
};
