import {buildMockCitation} from '../../test/mock-citation.js';
import {
  setIsVisible,
  setIsLoading,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
  registerFieldsToIncludeInCitations,
  setAnswerContentFormat,
  setIsEnabled,
} from './generated-answer-actions.js';
import {
  GeneratedContentFormat,
  generatedContentFormat,
} from './generated-response-format.js';

describe('generated answer', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#updateError', () => {
    it('should accept a full payload', () => {
      const testErrorPayload = {
        message: 'some message',
        code: 500,
      };
      expect(() => updateError(testErrorPayload)).not.toThrow();
    });

    it('should accept a payload without a message', () => {
      const testErrorPayload = {
        code: 500,
      };
      expect(() => updateError(testErrorPayload)).not.toThrow();
    });

    it('should accept a payload without a code', () => {
      const testErrorPayload = {
        message: 'some message',
      };
      expect(() => updateError(testErrorPayload)).not.toThrow();
    });
  });

  describe('#setIsLoading', () => {
    it('should accept a boolean payload', () => {
      expect(() => setIsLoading(true)).not.toThrow();
    });
  });

  describe('#updateMessage', () => {
    it('should accept a valid payload', () => {
      const testText = 'some message';
      expect(() => updateMessage({textDelta: testText})).not.toThrow();
    });
  });

  describe('#updateCitations', () => {
    it('should accept a valid payload', () => {
      const testCitations = [buildMockCitation()];
      expect(() => updateCitations({citations: testCitations})).not.toThrow();
    });
  });

  describe('#updateResponseFormat', () => {
    test.each(generatedContentFormat)(
      'should accept a valid payload with format: "%i"',
      (format: GeneratedContentFormat) => {
        expect(() =>
          updateResponseFormat({
            contentFormat: [format],
          })
        ).not.toThrow();
      }
    );
  });

  describe('#registerFieldsToIncludeInCitations', () => {
    const exampleFieldsToIncludeInCitations = ['foo', 'bar'];

    it('should accept a valid payload', () => {
      expect(() =>
        registerFieldsToIncludeInCitations(exampleFieldsToIncludeInCitations)
      ).not.toThrow();
    });
  });

  describe('#setIsVisible', () => {
    it('should accept a valid payload', () => {
      expect(() => setIsVisible(true)).not.toThrow();
    });
  });

  describe('#setIsEnabled', () => {
    it('should accept a valid payload', () => {
      expect(() => setIsEnabled(true)).not.toThrow();
    });
  });

  describe('#setAnswerContentFormat', () => {
    test.each(generatedContentFormat)(
      'should accept a valid payload with format: "%i"',
      (format: GeneratedContentFormat) => {
        expect(() => setAnswerContentFormat(format)).not.toThrow();
      }
    );
  });
});
