import {DisconnectedError} from '../../../utils/errors';

export interface UnifiedCommerceAPIError {
  errorCode: number;
  message: string;
  ignored?: boolean;
}

function buildDisconnectedError(
  error: DisconnectedError
): UnifiedCommerceAPIError {
  return {
    errorCode: error.statusCode,
    message: error.message,
  };
}

function buildIgnoredAbortedError(
  error: DOMException
): UnifiedCommerceAPIError {
  return {
    errorCode: error.code,
    message: error.message,
    ignored: true,
  };
}

export function buildAPIResponseFromErrorOrThrow(
  error: Error | DOMException,
  disableAbortWarning?: boolean
): {
  error: UnifiedCommerceAPIError;
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
