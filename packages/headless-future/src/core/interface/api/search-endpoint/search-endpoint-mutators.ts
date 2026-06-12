import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {SearchEndpointStatus} from './search-endpoint-types.js';
import {
  setStatus as _setStatus,
  setError as _setError,
  setConfiguration as _setConfiguration,
} from '@/src/core/internal/api/search-endpoint/search-endpoint-actions.js';

export const setStatus = (status: SearchEndpointStatus): StateMutation => {
  return _setStatus(status);
};

export const setError = (error: string | null): StateMutation => {
  return _setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>
): StateMutation => {
  return _setConfiguration(configuration);
};
