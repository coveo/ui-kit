import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {SearchEndpointStatus} from './search-endpoint-types.js';
import {searchEndpointSlice} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';

export const setStatus = (status: SearchEndpointStatus): StateMutation => {
  return searchEndpointSlice.actions.setStatus(status);
};

export const setError = (error: string | null): StateMutation => {
  return searchEndpointSlice.actions.setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>
): StateMutation => {
  return searchEndpointSlice.actions.setConfiguration(configuration);
};
