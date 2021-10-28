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

function buildDisconnectedError(
  error: DisconnectedError
): SearchAPIErrorWithStatusCode {
  return {
    statusCode: error.statusCode,
    type: error.name,
    message: error.message,
  };
}

export function buildAPIResponseFromErrorOrThrow(error: Error): {
  error: SearchAPIErrorWithStatusCode;
} {
  if (error instanceof DisconnectedError) {
    return {error: buildDisconnectedError(error)};
  }
  throw error;
}
