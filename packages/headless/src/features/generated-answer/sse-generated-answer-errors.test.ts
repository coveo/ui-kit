import {
  GeneratedAnswerSseErrorCode,
  mapRunErrorCode,
  withGeneratedAnswerSseErrorHelpers,
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

  describe('withGeneratedAnswerSseErrorHelpers', () => {
    it('returns undefined when no error is provided', () => {
      expect(withGeneratedAnswerSseErrorHelpers()).toBeUndefined();
    });

    it('adds SSE helper predicates to the decorated error', () => {
      const decorated = withGeneratedAnswerSseErrorHelpers({
        message: 'turn limit reached',
        code: GeneratedAnswerSseErrorCode.SseTurnLimitReached,
      });

      expect(decorated?.isSseTurnLimitReachedError()).toBe(true);
      expect(decorated?.isSseInternalError()).toBe(false);
      expect(decorated?.isConversationNotFoundError()).toBe(false);
    });

    it('keeps helper methods non-enumerable', () => {
      const decorated = withGeneratedAnswerSseErrorHelpers({
        code: GeneratedAnswerSseErrorCode.SseInternalError,
      });

      expect(Object.keys(decorated ?? {})).not.toContain('isSseInternalError');
    });
  });
});
