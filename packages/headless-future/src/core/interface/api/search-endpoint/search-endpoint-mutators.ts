import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {SearchEndpointStatus} from './search-endpoint-types.js';
import * as searchEndpointActions from '@/src/core/internal/api/search-endpoint/search-endpoint-actions.js';

export const setStatus = (status: SearchEndpointStatus): StateMutation => {
  return searchEndpointActions.setStatus(status);
};

export const setError = (error: string | null): StateMutation => {
  return searchEndpointActions.setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>
): StateMutation => {
  return searchEndpointActions.setConfiguration(configuration);
};
