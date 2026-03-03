/**
 * Enumeration of error codes for Server-Sent Events (SSE) related to generated answers.
 */
export enum GeneratedAnswerSseErrorCode {
  SseMaxDurationExceeded = 1000,
  SseFollowUpNotSupported = 1001,
  ConversationNotFound = 1002,
  SseModelsNotAvailable = 1003,
  SseInternalError = 1004,
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
