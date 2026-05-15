import {StateMutation} from '@/src/core/index.js';
import {SearchApiStatus} from './search-api-types.js';
import {searchApiSlice} from '@/src/core/internal/api/search-api/search-api-slice.js';

export const setStatus = (status: SearchApiStatus): StateMutation => {
  return searchApiSlice.actions.setStatus(status);
};

export const setError = (error: string | null): StateMutation => {
  return searchApiSlice.actions.setError(error);
};

export const setConfiguration = (
  configuration: Record<string, any>
): StateMutation => {
  return searchApiSlice.actions.setConfiguration(configuration);
};
