import {buildMockCitation} from '../../test/mock-citation.js';
import {
  type GeneratedContentFormat,
  generatedContentFormat,
} from '../generated-answer/generated-response-format.js';
import {
  addFollowUpAnswer,
  resetFollowUpAnswers,
  setActiveFollowUpAnswerCitations,
  setActiveFollowUpAnswerContentFormat,
  setActiveFollowUpAnswerId,
  setActiveFollowUpCannotAnswer,
  setActiveFollowUpError,
  setActiveFollowUpIsLoading,
  setActiveFollowUpIsStreaming,
  setFollowUpAnswersSessionId,
  setIsEnabled,
  updateActiveFollowUpAnswerMessage,
} from './follow-up-answers-actions.js';

describe('follow-up answers actions', () => {
  describe('#setIsEnabled', () => {
    it('should accept a boolean payload', () => {
      expect(() => setIsEnabled(true)).not.toThrow();
      expect(() => setIsEnabled(false)).not.toThrow();
    });
  });

  describe('#addFollowUpAnswer', () => {
    it('should accept a string payload', () => {
      const question = 'example question';
      expect(() => addFollowUpAnswer(question)).not.toThrow();
    });
  });

  describe('#updateActiveFollowUpAnswerMessage', () => {
    it('should accept a valid payload', () => {
      const testText = 'some message';
      expect(() =>
        updateActiveFollowUpAnswerMessage({textDelta: testText})
      ).not.toThrow();
    });
  });

  describe('#setActiveFollowUpAnswerCitations', () => {
    it('should accept a valid citation', () => {
      const testCitations = [buildMockCitation()];
      expect(() =>
        setActiveFollowUpAnswerCitations({citations: testCitations})
      ).not.toThrow();
    });
  });

  describe('#setActiveFollowUpError', () => {
    it('should accept a full error payload', () => {
      const testErrorPayload = {
        message: 'some message',
        code: 500,
      };
      expect(() => setActiveFollowUpError(testErrorPayload)).not.toThrow();
    });

    it('should accept a payload without a message', () => {
      const testErrorPayload = {
        code: 500,
      };
      expect(() => setActiveFollowUpError(testErrorPayload)).not.toThrow();
    });

    it('should accept a payload without a code', () => {
      const testErrorPayload = {
        message: 'some message',
      };
      expect(() => setActiveFollowUpError(testErrorPayload)).not.toThrow();
    });
  });

  describe('#setActiveFollowUpIsLoading', () => {
    it('should accept a boolean payload', () => {
      expect(() => setActiveFollowUpIsLoading(true)).not.toThrow();
      expect(() => setActiveFollowUpIsLoading(false)).not.toThrow();
    });
  });

  describe('#setActiveFollowUpIsStreaming', () => {
    it('should accept a boolean payload', () => {
      expect(() => setActiveFollowUpIsStreaming(true)).not.toThrow();
      expect(() => setActiveFollowUpIsStreaming(false)).not.toThrow();
    });
  });

  describe('#setActiveFollowUpAnswerContentFormat', () => {
    test.each(generatedContentFormat)(
      'should accept a valid payload with format: "%s"',
      (format: GeneratedContentFormat) => {
        expect(() =>
          setActiveFollowUpAnswerContentFormat(format)
        ).not.toThrow();
      }
    );
  });

  describe('#setActiveFollowUpAnswerId', () => {
    it('should accept a valid payload', () => {
      const testId = 'test-answer-id';
      expect(() => setActiveFollowUpAnswerId(testId)).not.toThrow();
    });
  });

  describe('#setActiveFollowUpCannotAnswer', () => {
    it('should accept a boolean payload', () => {
      expect(() => setActiveFollowUpCannotAnswer(true)).not.toThrow();
      expect(() => setActiveFollowUpCannotAnswer(false)).not.toThrow();
    });
  });

  describe('#resetFollowUpAnswers', () => {
    it('should not throw when called', () => {
      expect(() => resetFollowUpAnswers()).not.toThrow();
    });
  });

  describe('#setFollowUpAnswersSessionId', () => {
    it('should accept a valid payload', () => {
      const testSessionId = 'test-session-id';
      expect(() => setFollowUpAnswersSessionId(testSessionId)).not.toThrow();
    });
  });
});
