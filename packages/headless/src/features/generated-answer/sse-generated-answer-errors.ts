/**
 * Enumeration of error codes for Server-Sent Events (SSE) related to generated answers.
 */
export enum GeneratedAnswerSseErrorCode {
  SseMaxDurationExceeded = 1000,
  SseFollowUpNotSupported = 1001,
  ConversationNotFound = 1002,
  SseModelsNotAvailable = 1003,
  SseInternalError = 1004,
  SseTurnLimitReached = 1005,
}

interface GeneratedAnswerErrorWithSseHelpers {
  message?: string;
  code?: number;
  isRetryable?: boolean;
  isMaxDurationExceededError(): boolean;
  isFollowupNotSupportedError(): boolean;
  isConversationNotFoundError(): boolean;
  isSseModelNotAvailableError(): boolean;
  isSseInternalError(): boolean;
  isSseTurnLimitReachedError(): boolean;
}

const generatedAnswerSseErrorMap: Record<string, GeneratedAnswerSseErrorCode> =
  {
    'KNOWLEDGE:SSE_MAX_DURATION_EXCEEDED':
      GeneratedAnswerSseErrorCode.SseMaxDurationExceeded,
    'KNOWLEDGE:SSE_FOLLOW_UP_NOT_SUPPORTED':
      GeneratedAnswerSseErrorCode.SseFollowUpNotSupported,
    'KNOWLEDGE:NOT_FOUND': GeneratedAnswerSseErrorCode.ConversationNotFound,
    'KNOWLEDGE:SSE_MODELS_NOT_AVAILABLE':
      GeneratedAnswerSseErrorCode.SseModelsNotAvailable,
    'KNOWLEDGE:SSE_INTERNAL_ERROR':
      GeneratedAnswerSseErrorCode.SseInternalError,
    'KNOWLEDGE:TURN_LIMIT_REACHED':
      GeneratedAnswerSseErrorCode.SseTurnLimitReached,
  };

/**
 * Maps backend error codes to frontend error codes for generated answer SSE errors.
 */
export function mapRunErrorCode(code?: string): GeneratedAnswerSseErrorCode {
  if (!code) return GeneratedAnswerSseErrorCode.SseInternalError;
  return (
    generatedAnswerSseErrorMap[code] ??
    GeneratedAnswerSseErrorCode.SseInternalError
  );
}

function attachErrorHelpers<T extends {code?: number}>(error: T) {
  const isCode = (value: GeneratedAnswerSseErrorCode) => error.code === value;

  Object.defineProperties(error, {
    isMaxDurationExceededError: {
      value: () => isCode(GeneratedAnswerSseErrorCode.SseMaxDurationExceeded),
      enumerable: false,
    },
    isFollowupNotSupportedError: {
      value: () => isCode(GeneratedAnswerSseErrorCode.SseFollowUpNotSupported),
      enumerable: false,
    },
    isConversationNotFoundError: {
      value: () => isCode(GeneratedAnswerSseErrorCode.ConversationNotFound),
      enumerable: false,
    },
    isSseModelNotAvailableError: {
      value: () => isCode(GeneratedAnswerSseErrorCode.SseModelsNotAvailable),
      enumerable: false,
    },
    isSseInternalError: {
      value: () => isCode(GeneratedAnswerSseErrorCode.SseInternalError),
      enumerable: false,
    },
    isSseTurnLimitReachedError: {
      value: () => isCode(GeneratedAnswerSseErrorCode.SseTurnLimitReached),
      enumerable: false,
    },
  });

  return error as T & GeneratedAnswerErrorWithSseHelpers;
}

/**
 * Decorates a generated answer error with helper predicates for SSE error codes.
 */
export function withGeneratedAnswerSseErrorHelpers<
  T extends {
    message?: string;
    code?: number;
    isRetryable?: boolean;
  },
>(error?: T): (T & GeneratedAnswerErrorWithSseHelpers) | undefined {
  if (!error) {
    return undefined;
  }

  return attachErrorHelpers({...error});
}
