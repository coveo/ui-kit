import {buildMockCitation} from '../../test/mock-citation.js';
import {
  generateAnswer,
  registerFieldsToIncludeInCitations,
  setAnswerContentFormat,
  setIsEnabled,
  setIsLoading,
  setIsVisible,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
} from './generated-answer-actions.js';
import {
  type GeneratedContentFormat,
  generatedContentFormat,
} from './generated-response-format.js';

vi.mock('./generated-answer-request.js', () => ({
  constructAnswerAPIQueryParams: vi.fn(() => ({
    q: 'test query',
    searchHub: 'default',
    pipeline: 'default',
    analytics: {
      actionCause: 'searchboxSubmit',
      clientId: 'test-client-id',
    },
  })),
}));

vi.mock('../../api/knowledge/stream-answer-api.js', () => ({
  fetchAnswer: vi.fn(() => ({type: 'mocked/fetchAnswer'})),
}));

vi.mock('../search/search-actions.js', () => ({
  updateSearchAction: vi.fn(() => ({type: 'search/updateSearchAction'})),
}));

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

  describe('#generateAnswer', () => {
    const mockDispatch = vi.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return Promise.resolve({type: 'mock/resolved'});
      }
      return action;
    });

    it('should dispatch resetAnswer', async () => {
      const mockGetState = vi.fn(() => ({
        generatedAnswer: {
          answerConfigurationId: 'test-config-id',
        },
      }));

      const mockNavigatorContext = {};
      const mockLogger = {warn: vi.fn()};
      const mockExtra = {
        navigatorContext: mockNavigatorContext,
        logger: mockLogger,
      };

      const thunk = generateAnswer();
      await thunk(mockDispatch, mockGetState, mockExtra);

      const resetAnswerCall = mockDispatch.mock.calls.find(
        (call) => call[0]?.type === 'generatedAnswer/resetAnswer'
      );
      expect(resetAnswerCall).toBeDefined();
    });

    it('should dispatch setAnswerApiQueryParams with constructed parameters when answerConfigurationId is present', async () => {
      const mockGetState = vi.fn(() => ({
        generatedAnswer: {
          answerConfigurationId: 'test-config-id',
        },
      }));

      const mockNavigatorContext = {};
      const mockLogger = {warn: vi.fn()};
      const mockExtra = {
        navigatorContext: mockNavigatorContext,
        logger: mockLogger,
      };

      const thunk = generateAnswer();
      await thunk(mockDispatch, mockGetState, mockExtra);

      const setAnswerApiQueryParamsCall = mockDispatch.mock.calls.find(
        (call) => call[0]?.type === 'generatedAnswer/setAnswerApiQueryParams'
      );
      expect(setAnswerApiQueryParamsCall).toBeDefined();
      expect(setAnswerApiQueryParamsCall?.[0].payload).toHaveProperty(
        'q',
        'test query'
      );
    });

    it('should log warning when answerConfigurationId is missing', async () => {
      const mockDispatch = vi.fn();
      const mockGetState = vi.fn(() => ({
        generatedAnswer: {
          answerConfigurationId: undefined,
        },
      }));
      const mockLogger = {warn: vi.fn()};
      const mockExtra = {navigatorContext: {}, logger: mockLogger};

      const thunk = generateAnswer();
      await thunk(mockDispatch, mockGetState, mockExtra);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'Missing answerConfigurationId in engine configuration'
        )
      );
    });
  });
});
