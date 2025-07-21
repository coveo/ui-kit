import {DisconnectedError} from '../../utils/errors.js';
import type {QueryException} from './search/query-exception.js';

export interface SearchAPIErrorWithStatusCode {
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
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

function buildIgnoredAbortedError(
  error: DOMException
): SearchAPIErrorWithStatusCode {
  return {
    statusCode: error.code,
    type: error.name,
    message: error.message,
    ignored: true,
  };
}

export function buildAPIResponseFromErrorOrThrow(
  error: Error | DOMException,
  disableAbortWarning?: boolean
): {
  error: SearchAPIErrorWithStatusCode;
} {
  if (disableAbortWarning && error.name === 'AbortError') {
    return {
      error: buildIgnoredAbortedError(error as DOMException),
    };
  }
  if (error instanceof DisconnectedError) {
    return {error: buildDisconnectedError(error)};
  }
  throw error;
}
