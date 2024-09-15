import {buildMockCitation} from '../../test/mock-citation';
import {
  setIsLoading,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
  registerFieldsToIncludeInCitations,
  setAnswerContentFormat,
} from './generated-answer-actions';
import {
  GeneratedAnswerStyle,
  GeneratedContentFormat,
  generatedAnswerStyle,
  generatedContentFormat,
} from './generated-response-format';

describe('generated answer', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
    test.each(generatedAnswerStyle)(
      'should accept a valid payload with style: "%i"',
      (style: GeneratedAnswerStyle) => {
        expect(() => updateResponseFormat({answerStyle: style})).not.toThrow();
      }
    );

    test.each(generatedContentFormat)(
      'should accept a valid payload with format: "%i"',
      (format: GeneratedContentFormat) => {
        expect(() =>
          updateResponseFormat({
            answerStyle: 'default',
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

  describe('#setAnswerContentFormat', () => {
    test.each(generatedContentFormat)(
      'should accept a valid payload with format: "%i"',
      (format: GeneratedContentFormat) => {
        expect(() => setAnswerContentFormat(format)).not.toThrow();
      }
    );
  });
});
