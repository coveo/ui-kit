import {
  GeneratedAnswerSseErrorCode,
  mapRunErrorCode,
} from './sse-generated-answer-errors.js';

describe('sse-generated-answer-errors', () => {
  describe('mapRunErrorCode', () => {
    it('returns SseInternalError when no code is provided', () => {
      expect(mapRunErrorCode()).toBe(
        GeneratedAnswerSseErrorCode.SseInternalError
      );
    });

    it.each([
      [
        'KNOWLEDGE:SSE_MAX_DURATION_EXCEEDED',
        GeneratedAnswerSseErrorCode.SseMaxDurationExceeded,
      ],
      [
        'KNOWLEDGE:SSE_FOLLOW_UP_NOT_SUPPORTED',
        GeneratedAnswerSseErrorCode.SseFollowUpNotSupported,
      ],
      ['KNOWLEDGE:NOT_FOUND', GeneratedAnswerSseErrorCode.ConversationNotFound],
      [
        'KNOWLEDGE:SSE_MODELS_NOT_AVAILABLE',
        GeneratedAnswerSseErrorCode.SseModelsNotAvailable,
      ],
      [
        'KNOWLEDGE:SSE_INTERNAL_ERROR',
        GeneratedAnswerSseErrorCode.SseInternalError,
      ],
      [
        'KNOWLEDGE:TURN_LIMIT_REACHED',
        GeneratedAnswerSseErrorCode.SseTurnLimitReached,
      ],
    ])(
      'maps %s to the expected frontend error code',
      (backendCode, expected) => {
        expect(mapRunErrorCode(backendCode)).toBe(expected);
      }
    );

    it('returns SseInternalError when the backend code is not mapped', () => {
      expect(mapRunErrorCode('UNKNOWN_CODE')).toBe(
        GeneratedAnswerSseErrorCode.SseInternalError
      );
    });
  });
});
