/* oxlint-disable @typescript-eslint/no-explicit-any -- unit tests */
import {buildMockCitation} from '../../test/mock-citation.js';
import {
  generateAnswer,
  registerFieldsToIncludeInCitations,
  setAnswerContentFormat,
  setIsEnabled,
  setIsLoading,
  setIsVisible,
  streamAnswer,
  updateCitations,
  updateError,
  updateMessage,
  updateResponseFormat,
} from './generated-answer-actions.js';
import {generatedAnswerAnalyticsClient} from './generated-answer-analytics-actions.js';
import {type GeneratedContentFormat, generatedContentFormat} from './generated-response-format.js';

vi.mock('./generated-answer-request.js', () => ({
  buildStreamingRequest: vi.fn(() =>
    Promise.resolve({
      accessToken: 'test-token',
      organizationId: 'test-org',
      url: 'https://test.org',
      streamId: 'test-stream-id',
    })
  ),
  constructAnswerAPIQueryParams: vi.fn(() => ({
    q: 'test query',
    searchHub: 'default',
    pipeline: 'default',
    analytics: {
      actionCause: 'searchboxSubmit',
      clientId: 'test-client-id',
    },
  })),
  constructGenerateHeadAnswerParams: vi.fn(() => ({
    q: 'test query',
    searchHub: 'default',
    pipeline: 'default',
    locale: 'en',
    analytics: {
      actionCause: 'searchboxSubmit',
      clientId: 'test-client-id',
    },
  })),
}));

vi.mock('../../api/knowledge/stream-answer-api.js', () => ({
  fetchAnswer: vi.fn(() => ({type: 'mocked/fetchAnswer'})),
}));

vi.mock('../../api/knowledge/answer-generation/endpoints/answer/answer-endpoint.js', () => ({
  initiateAnswerEndpoint: vi.fn(() => ({
    type: 'mocked/initiateAnswerEndpoint',
  })),
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

  describe('#streamAnswer', () => {
    const buildFakeStreamingClient = () => {
      let writeCallback: ((data: Record<string, unknown>) => void) | undefined;
      return {
        streamGeneratedAnswer: vi.fn((_request, callbacks) => {
          writeCallback = callbacks.write;
          return new AbortController();
        }),
        emitEndOfStream: (answerGenerated: boolean) => {
          writeCallback?.({
            payloadType: 'genqa.endOfStreamType',
            payload: JSON.stringify({answerGenerated}),
          });
        },
      };
    };

    const mockDispatch = vi.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return Promise.resolve({type: 'mock/resolved'});
      }
      return action;
    });

    const mockLogger = {warn: vi.fn()};

    const buildMockGetState = () =>
      vi.fn(
        () =>
          ({
            debug: false,
            search: {
              queryExecuted: 'test query',
              extendedResults: {generativeQuestionAnsweringId: 'test-stream-id'},
            },
            generatedAnswer: {
              answerId: 'test-answer-id',
              answer: 'some answer',
            },
            configuration: {
              accessToken: 'test-token',
              organizationId: 'test-org',
              environment: 'prod',
              search: {apiBaseUrl: 'https://test.org'},
            },
          }) as any
      );

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should dispatch the extra thunk argument generatedAnswerAnalyticsClient.logGeneratedAnswerStreamEnd when it is registered', async () => {
      const fakeStreamingClient = buildFakeStreamingClient();
      const mockInsightAnalyticsClient = {
        logGeneratedAnswerStreamEnd: vi.fn(() => ({
          type: 'analytics/generatedAnswer/streamEnd',
        })),
      } as any;
      const mockExtra = {
        streamingClient: fakeStreamingClient,
        logger: mockLogger,
        generatedAnswerAnalyticsClient: mockInsightAnalyticsClient,
      } as any;

      const thunk = streamAnswer({setAbortControllerRef: vi.fn()});
      const runPromise = thunk(mockDispatch, buildMockGetState(), mockExtra);
      await Promise.resolve();
      await Promise.resolve();
      fakeStreamingClient.emitEndOfStream(true);
      await runPromise;

      expect(mockInsightAnalyticsClient.logGeneratedAnswerStreamEnd).toHaveBeenCalledTimes(1);
    });

    it('should fall back to the Search generatedAnswerAnalyticsClient when it is not registered as an extra thunk argument', async () => {
      const fakeStreamingClient = buildFakeStreamingClient();
      const mockExtra = {
        streamingClient: fakeStreamingClient,
        logger: mockLogger,
        generatedAnswerAnalyticsClient: undefined,
      } as any;
      const logStreamEndSpy = vi.spyOn(
        generatedAnswerAnalyticsClient,
        'logGeneratedAnswerStreamEnd'
      );

      const thunk = streamAnswer({setAbortControllerRef: vi.fn()});
      const runPromise = thunk(mockDispatch, buildMockGetState(), mockExtra);
      await Promise.resolve();
      await Promise.resolve();
      fakeStreamingClient.emitEndOfStream(true);
      await runPromise;

      expect(logStreamEndSpy).toHaveBeenCalledTimes(1);
    });

    it('should not throw when generatedAnswerAnalyticsClient is entirely absent from extra', async () => {
      const fakeStreamingClient = buildFakeStreamingClient();
      const mockExtra = {
        streamingClient: fakeStreamingClient,
        logger: mockLogger,
      } as any;

      const thunk = streamAnswer({setAbortControllerRef: vi.fn()});
      const runPromise = thunk(mockDispatch, buildMockGetState(), mockExtra);
      await Promise.resolve();
      await Promise.resolve();

      expect(() => fakeStreamingClient.emitEndOfStream(false)).not.toThrow();
      await expect(runPromise).resolves.not.toThrow();
    });
  });

  describe('#generateAnswer', () => {
    const mockDispatch = vi.fn().mockImplementation((action) => {
      if (typeof action === 'function') {
        return Promise.resolve({type: 'mock/resolved'});
      }
      return action;
    });

    const mockNavigatorContext = {};
    const mockLogger = {warn: vi.fn()};
    const mockExtra = {
      navigatorContext: mockNavigatorContext,
      logger: mockLogger,
    } as any;
    const mockGetState = vi.fn(
      () =>
        ({
          generatedAnswer: {
            answerConfigurationId: 'test-config-id',
          },
          searchHub: 'default',
          pipeline: 'default',
        }) as any
    );

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should dispatch resetAnswer', async () => {
      const thunk = generateAnswer();
      await thunk(mockDispatch, mockGetState, mockExtra);

      const resetAnswerCall = mockDispatch.mock.calls.find(
        (call) => call[0]?.type === 'generatedAnswer/resetAnswer'
      );
      expect(resetAnswerCall).toBeDefined();
    });

    it('should dispatch setAnswerApiQueryParams with constructed parameters when answerConfigurationId is present', async () => {
      const thunk = generateAnswer();
      await thunk(mockDispatch, mockGetState, mockExtra);

      const setAnswerApiQueryParamsCall = mockDispatch.mock.calls.find(
        (call) => call[0]?.type === 'generatedAnswer/setAnswerApiQueryParams'
      );
      expect(setAnswerApiQueryParamsCall).toBeDefined();
      expect(setAnswerApiQueryParamsCall?.[0].payload).toHaveProperty('q', 'test query');
    });

    it('should log warning when answerConfigurationId is missing', async () => {
      const mockGetState = vi.fn(
        () =>
          ({
            generatedAnswer: {
              answerConfigurationId: undefined,
            },
            searchHub: 'default',
            pipeline: 'default',
          }) as any
      );

      const thunk = generateAnswer();
      await thunk(mockDispatch, mockGetState, mockExtra);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Missing answerConfigurationId in engine configuration')
      );
    });

    describe('when the generated answer is disabled', () => {
      const mockGetDisabledState = vi.fn(
        () =>
          ({
            generatedAnswer: {
              answerConfigurationId: 'test-config-id',
              isEnabled: false,
            },
            searchHub: 'default',
            pipeline: 'default',
          }) as any
      );

      it('should reset the answer but not fetch a new one', async () => {
        const thunk = generateAnswer();
        await thunk(mockDispatch, mockGetDisabledState, mockExtra);

        const resetAnswerCall = mockDispatch.mock.calls.find(
          (call) => call[0]?.type === 'generatedAnswer/resetAnswer'
        );
        expect(resetAnswerCall).toBeDefined();

        const setAnswerApiQueryParamsCall = mockDispatch.mock.calls.find(
          (call) => call[0]?.type === 'generatedAnswer/setAnswerApiQueryParams'
        );
        expect(setAnswerApiQueryParamsCall).toBeUndefined();
      });

      it('should log a warning', async () => {
        const thunk = generateAnswer();
        await thunk(mockDispatch, mockGetDisabledState, mockExtra);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          expect.stringContaining(
            'generateAnswer action was dispatched while the generated answer is disabled'
          )
        );
      });
    });
  });
});
