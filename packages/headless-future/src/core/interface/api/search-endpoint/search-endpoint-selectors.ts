import {searchEndpointSlice} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';
import {SearchEndpointState} from './search-endpoint-types.js';

type StateWithSearchEndpointSlice = {searchEndpoint: SearchEndpointState};

export const status = (state: StateWithSearchEndpointSlice) => {
  return state.searchEndpoint.status;
};

export const isLoading = (state: StateWithSearchEndpointSlice) => {
  return state.searchEndpoint.status === 'pending';
};

export const error = (state: StateWithSearchEndpointSlice) => {
  return searchEndpointSlice.selectors.error(state);
};

export const configuration = (state: StateWithSearchEndpointSlice) => {
  return searchEndpointSlice.selectors.configuration(state);
};
