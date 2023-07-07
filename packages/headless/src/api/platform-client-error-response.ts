import {DisconnectedError} from '../utils/errors';

export interface PlatformAPIErrorWithStatusCode {
  statusCode: number;
  message: string;
  type: string;
  ignored?: boolean;
}

function buildDisconnectedError(
  error: DisconnectedError
): PlatformAPIErrorWithStatusCode {
  return {
    statusCode: error.statusCode,
    type: error.name,
    message: error.message,
  };
}

function buildIgnoredAbortedError(
  error: DOMException
): PlatformAPIErrorWithStatusCode {
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
  error: PlatformAPIErrorWithStatusCode;
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
