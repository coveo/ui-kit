import {DisconnectedError} from '../../utils/errors';
import {QueryException} from './search/query-exception';

export interface SearchAPIErrorWithStatusCode {
  statusCode: number;
  message: string;
  type: string;
  ignore?: boolean;
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
    ignore: true,
  };
}

export function buildAPIResponseFromErrorOrThrow(
  error: Error,
  disableAbortWarning?: boolean
): {
  error: SearchAPIErrorWithStatusCode;
} {
  const asDOMException = error as DOMException;
  if (disableAbortWarning && asDOMException.code === 20) {
    return {
      error: buildIgnoredAbortedError(asDOMException),
    };
  }
  if (error instanceof DisconnectedError) {
    return {error: buildDisconnectedError(error)};
  }
  throw error;
}
