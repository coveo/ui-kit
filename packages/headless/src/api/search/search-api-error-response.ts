import {DisconnectedError} from '../../utils/errors';
import {QueryException} from './search/query-exception';

export interface SearchAPIErrorWithStatusCode {
  statusCode: number;
  message: string;
  type: string;
}

export interface SearchAPIErrorWithExceptionInBody {
  exception: QueryException;
}

function buildDisconnectedError(): SearchAPIErrorWithStatusCode {
  return {
    statusCode: 0,
    type: 'Disconnected',
    message: 'Could not connect',
  };
}

export function buildAPIResponseFromErrorOrThrow(
  error: Error
): {error: SearchAPIErrorWithStatusCode} {
  if (error instanceof DisconnectedError) {
    return {error: buildDisconnectedError()};
  }
  throw error;
}
