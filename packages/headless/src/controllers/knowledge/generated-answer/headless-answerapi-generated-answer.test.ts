import {skipToken} from '@reduxjs/toolkit/query';
import {answerEvaluation} from '../../../api/knowledge/post-answer-evaluation.js';
import {
  answerApi,
  fetchAnswer,
  selectAnswer,
} from '../../../api/knowledge/stream-answer-api.js';
import type {StreamAnswerAPIState} from '../../../api/knowledge/stream-answer-api-state.js';
import {getConfigurationInitialState} from '../../../features/configuration/configuration-state.js';
import * as answerApiSelectors from '../../../features/generated-answer/answer-api-selectors.js';
import {selectAnswerTriggerParams} from '../../../features/generated-answer/answer-api-selectors.js';
import {
  generateAnswer,
  resetAnswer,
  updateAnswerConfigurationId,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions.js';
import {
  type GeneratedAnswerFeedback,
  generatedAnswerAnalyticsClient,
} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {getGeneratedAnswerInitialState} from '../../../features/generated-answer/generated-answer-state.js';
import {queryReducer} from '../../../features/query/query-slice.js';
import {buildMockAnalyticsState} from '../../../test/mock-analytics-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import type {
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../generated-answer/headless-generated-answer.js';
import {buildAnswerApiGeneratedAnswer} from './headless-answerapi-generated-answer.js';

vi.mock('../../../features/generated-answer/generated-answer-actions');
vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);
vi.mock('../../../features/search/search-actions');
vi.mock('../../../api/knowledge/stream-answer-actions.js');

vi.mock(
  '../../../features/generated-answer/answer-api-selectors.js',
  async () => {
    return {
      selectAnswerTriggerParams: vi.fn(),
      selectAnswerApiQueryParams: vi.fn(),
    };
  }
);

vi.mock('../../../api/knowledge/stream-answer-api', async () => {
  const originalStreamAnswerApi = await vi.importActual(
    '../../../api/knowledge/stream-answer-api'
  );
  return {
    ...originalStreamAnswerApi,
    fetchAnswer: vi.fn(),
    selectAnswer: vi.fn(),
  };
});

vi.mock('../../../api/knowledge/post-answer-evaluation', () => ({
  answerEvaluation: {
    endpoints: {
      post: {
        initiate: vi.fn(),
      },
    },
  },
}));

describe('knowledge-generated-answer', () => {
  let engine: MockedSearchEngine;
  const mockSelectAnswer = vi.mocked(selectAnswer);

  const createGeneratedAnswer = (props: GeneratedAnswerProps = {}) =>
    buildAnswerApiGeneratedAnswer(
      engine,
      generatedAnswerAnalyticsClient,
      props
    );

  const buildEngineWithGeneratedAnswer = (
    initialState: Partial<StreamAnswerAPIState> = {}
  ) => {
    const state = createMockState({
      ...initialState,
      generatedAnswer: {
        ...getGeneratedAnswerInitialState(),
        ...initialState.generatedAnswer,
      },
      search: {
        ...initialState.search!,
        searchAction: {
          actionCause: 'searchboxSubmit',
        },
      },
    });
    return buildMockSearchEngine(state);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    engine = buildEngineWithGeneratedAnswer();
  });

  it('initializes', () => {
    const generatedAnswer = createGeneratedAnswer();
    expect(generatedAnswer).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    createGeneratedAnswer();
    expect(engine.addReducers).toHaveBeenCalledWith({
      [answerApi.reducerPath]: answerApi.reducer,
      query: queryReducer,
    });
  });

  it('dispatches the configuration id upon initialization', () => {
    const answerConfigurationId = 'answerConfigurationId';
    createGeneratedAnswer({answerConfigurationId});
    expect(updateAnswerConfigurationId).toHaveBeenCalledWith(
      answerConfigurationId
    );
  });

  describe('AnswerApiGeneratedAnswer controller state', () => {
    describe('when RTK Query cache is uninitialized (cache miss)', () => {
      it('should expose undefined answer and default state flags', () => {
        mockSelectAnswer.mockReturnValue({
          data: undefined,
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.answer).toBeUndefined();
        expect(generatedAnswer.state.citations).toEqual([]);
        expect(generatedAnswer.state.error).toEqual({
          message: undefined,
          statusCode: undefined,
        });
        expect(generatedAnswer.state.isLoading).toBe(false);
        expect(generatedAnswer.state.isStreaming).toBe(false);
        expect(generatedAnswer.state.answerContentFormat).toBe('text/plain');
        expect(generatedAnswer.state.isAnswerGenerated).toBe(false);
      });
    });

    describe('when RTK Query is loading', () => {
      it('should expose isLoading = true and no answer yet', () => {
        mockSelectAnswer.mockReturnValue({
          data: {isLoading: true},
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.isLoading).toBe(true);
        expect(generatedAnswer.state.isStreaming).toBe(false);
        expect(generatedAnswer.state.answer).toBeUndefined();
        expect(generatedAnswer.state.isAnswerGenerated).toBe(false);
      });
    });

    describe('when RTK Query is streaming', () => {
      it('should expose isStreaming = true and partial answer', () => {
        mockSelectAnswer.mockReturnValue({
          data: {isStreaming: true, answer: 'partial...', isLoading: false},
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.isStreaming).toBe(true);
        expect(generatedAnswer.state.isLoading).toBe(false);
        expect(generatedAnswer.state.answer).toBe('partial...');
        expect(generatedAnswer.state.isAnswerGenerated).toBe(false);
      });
    });

    describe('when RTK Query is fulfilled', () => {
      it('should expose the full answer and citations without duplicates', () => {
        mockSelectAnswer.mockReturnValue({
          data: {
            generated: true,
            answer: 'final answer',
            citations: [
              {id: 'c1', uri: 'http://example.com/1'},
              {id: 'c2', uri: 'http://example.com/1'},
              {id: 'c2', uri: 'http://example.com/2'},
            ],
            isLoading: false,
            isStreaming: false,
          },
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.answer).toBe('final answer');
        expect(generatedAnswer.state.isAnswerGenerated).toBe(true);
        expect(generatedAnswer.state.citations).toEqual([
          {id: 'c1', uri: 'http://example.com/1'},
          {id: 'c2', uri: 'http://example.com/2'},
        ]);
        expect(generatedAnswer.state.isStreaming).toBe(false);
        expect(generatedAnswer.state.isLoading).toBe(false);
      });
    });

    describe('when RTK Query is rejected with error', () => {
      it('should expose error message and statusCode', () => {
        mockSelectAnswer.mockReturnValue({
          data: {
            error: {message: 'server error', code: 500},
          },
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.error).toEqual({
          message: 'server error',
          statusCode: 500,
        });
      });
    });

    describe('when RTK Query completes with generated = false', () => {
      it('should mark cannotAnswer = true if not loading or streaming', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: false, isLoading: false, isStreaming: false},
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.cannotAnswer).toBe(true);
      });
    });

    describe('when RTK Query completes with generated = undefined', () => {
      it('should mark cannotAnswer = false even if not loading or streaming', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: undefined, isLoading: false, isStreaming: false},
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.cannotAnswer).toBe(false);
      });
    });

    describe('when RTK Query is still loading with generated = false', () => {
      it('should mark cannotAnswer = false', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: false, isLoading: true, isStreaming: false},
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.cannotAnswer).toBe(false);
      });
    });

    describe('when RTK Query is still streaming with generated = false', () => {
      it('should mark cannotAnswer = false', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: false, isLoading: false, isStreaming: true},
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.cannotAnswer).toBe(false);
      });
    });

    describe('when RTK Query completes with generated = true', () => {
      it('should mark cannotAnswer = false', () => {
        mockSelectAnswer.mockReturnValue({
          data: {generated: true, isLoading: false, isStreaming: false},
        } as ReturnType<typeof selectAnswer>);

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.cannotAnswer).toBe(false);
      });
    });

    describe('when Redux state cannotAnswer is true', () => {
      it('should return cannotAnswer as true regardless of RTK Query state', () => {
        mockSelectAnswer.mockReturnValue({
          data: {
            answer: 'Some answer',
            generated: true,
            isLoading: false,
            isStreaming: false,
          },
        } as ReturnType<typeof selectAnswer>);

        engine = buildEngineWithGeneratedAnswer({
          generatedAnswer: {
            ...getGeneratedAnswerInitialState(),
            cannotAnswer: true,
          },
        });

        const generatedAnswer = createGeneratedAnswer();

        expect(generatedAnswer.state.cannotAnswer).toBe(true);
      });
    });
  });

  it('initialize the format', () => {
    const responseFormat: GeneratedResponseFormat = {
      contentFormat: ['text/markdown'],
    };
    createGeneratedAnswer({
      initialState: {responseFormat},
    });

    expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
  });

  it('dispatches a retry action when there are answer api query params in the state', () => {
    vi.spyOn(
      answerApiSelectors,
      'selectAnswerApiQueryParams'
    ).mockReturnValueOnce({
      q: 'this est une question',
    });

    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.retry();
    expect(fetchAnswer).toHaveBeenCalledTimes(1);
  });

  it('dispatches a retry action when the selector returns a skipToken', () => {
    vi.spyOn(
      answerApiSelectors,
      'selectAnswerApiQueryParams'
    ).mockReturnValueOnce(skipToken);

    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.retry();
    expect(fetchAnswer).toHaveBeenCalledTimes(1);
  });

  it('dispatches a reset action', () => {
    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.reset();
    expect(resetAnswer).toHaveBeenCalledTimes(1);
  });

  it('dispatches a sendFeedback action', () => {
    mockSelectAnswer.mockReturnValue({
      data: {answer: 'This est une answer', answerId: '12345_6'},
    } as ReturnType<typeof selectAnswer>);

    engine = buildEngineWithGeneratedAnswer({
      query: {q: 'this est une question', enableQuerySyntax: false},
    });
    const generatedAnswer = createGeneratedAnswer();
    const feedback: GeneratedAnswerFeedback = {
      readable: 'unknown',
      correctTopic: 'unknown',
      documented: 'yes',
      hallucinationFree: 'no',
      helpful: false,
      details: 'some details',
    };
    const expectedArgs = {
      additionalNotes: 'some details',
      answer: {
        format: 'text/plain',
        responseId: '12345_6',
        text: 'This est une answer',
      },
      correctAnswerUrl: null,
      details: {
        correctTopic: null,
        documented: true,
        hallucinationFree: false,
        readable: null,
      },
      helpful: false,
      question: 'this est une question',
    };
    generatedAnswer.sendFeedback(feedback);

    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerFeedback
    ).toHaveBeenCalledTimes(1);
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerFeedback
    ).toHaveBeenCalledWith(feedback);
    expect(answerEvaluation.endpoints.post.initiate).toHaveBeenCalledTimes(1);
    expect(answerEvaluation.endpoints.post.initiate).toHaveBeenCalledWith(
      expectedArgs
    );
  });

  describe('subscribeToSearchRequest', () => {
    const mockSelectAnswerTriggerParams = vi.mocked(selectAnswerTriggerParams);
    const mockGenerateAnswer = vi.mocked(generateAnswer);
    const mockResetAnswer = vi.mocked(resetAnswer);
    let listener: () => void;

    beforeEach(() => {
      vi.clearAllMocks();
      createGeneratedAnswer();
      listener = engine.subscribe.mock.calls[0][0];
    });

    describe('resetAnswer behavior to prepare for a new generated answer', () => {
      describe('when request ID changes', () => {
        it('should reset the answer to prepare for a new generated answer', () => {
          mockSelectAnswerTriggerParams.mockReturnValue({
            q: 'test query',
            requestId: 'new-request-123',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

          listener();

          expect(mockResetAnswer).toHaveBeenCalledTimes(1);
        });

        it('should reset the answer to prepare for a new generated answer even when query is empty', () => {
          mockSelectAnswerTriggerParams.mockReturnValue({
            q: '',
            requestId: 'new-request-456',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

          listener();

          expect(mockResetAnswer).toHaveBeenCalledTimes(1);
        });

        it('should reset the answer to prepare for a new generated answer for each different request ID', () => {
          mockSelectAnswerTriggerParams
            .mockReturnValueOnce({
              q: 'first query',
              requestId: 'request-1',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            })
            .mockReturnValueOnce({
              q: 'second query',
              requestId: 'request-2',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            });

          listener(); // First request
          listener(); // Second request

          expect(mockResetAnswer).toHaveBeenCalledTimes(2);
        });
      });

      describe('when request ID stays the same', () => {
        it('should not call resetAnswer on subsequent calls with same request ID', () => {
          mockSelectAnswerTriggerParams
            .mockReturnValueOnce({
              q: 'first query',
              requestId: 'same-request',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            })
            .mockReturnValueOnce({
              q: 'different query',
              requestId: 'same-request',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            });

          listener(); // First call with request ID
          listener(); // Same request ID, different query

          expect(mockResetAnswer).toHaveBeenCalledTimes(1);
        });
      });

      describe('when request ID is empty', () => {
        it('should not call resetAnswer', () => {
          mockSelectAnswerTriggerParams.mockReturnValue({
            q: 'test query',
            requestId: '',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

          listener();

          expect(mockResetAnswer).not.toHaveBeenCalled();
        });
      });
    });

    describe('generateAnswer behavior', () => {
      describe('when request is new and state has a query', () => {
        it('should call generateAnswer when request ID is new and has query', () => {
          mockSelectAnswerTriggerParams.mockReturnValue({
            q: 'test query',
            requestId: 'new-request',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

          listener();

          expect(mockGenerateAnswer).toHaveBeenCalledTimes(1);
        });

        it('should call generateAnswer for each new request with query', () => {
          mockSelectAnswerTriggerParams
            .mockReturnValueOnce({
              q: 'first query',
              requestId: 'request-1',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            })
            .mockReturnValueOnce({
              q: 'second query',
              requestId: 'request-2',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            });

          listener(); // First request
          listener(); // Second request

          expect(mockGenerateAnswer).toHaveBeenCalledTimes(2);
        });
      });

      describe('when request ID is empty', () => {
        it('should not call generateAnswer', () => {
          mockSelectAnswerTriggerParams.mockReturnValue({
            q: 'test query',
            requestId: '',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

          listener();

          expect(mockGenerateAnswer).not.toHaveBeenCalled();
        });
      });

      describe('when query is empty', () => {
        it('should not call generateAnswer even with valid request ID', () => {
          mockSelectAnswerTriggerParams.mockReturnValue({
            q: '',
            requestId: 'valid-request',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

          listener();

          expect(mockGenerateAnswer).not.toHaveBeenCalled();
        });
      });

      describe('when request ID stays the same', () => {
        it('should not call generateAnswer on subsequent calls', () => {
          mockSelectAnswerTriggerParams
            .mockReturnValueOnce({
              q: 'first query',
              requestId: 'same-request',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            })
            .mockReturnValueOnce({
              q: 'first query',
              requestId: 'same-request',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            });

          listener(); // First call with request ID
          listener(); // Same request ID

          expect(mockGenerateAnswer).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('user interaction scenarios', () => {
      describe('when the user clears their query', () => {
        it('should reset the answer and not generate a new one', () => {
          mockSelectAnswerTriggerParams
            .mockReturnValueOnce({
              q: 'test query',
              requestId: 'search-request-1',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            })
            .mockReturnValueOnce({
              q: '',
              requestId: 'search-request-2',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            });

          listener(); // Valid query - should trigger reset and generate
          listener(); // Empty query - should trigger reset but not generate

          expect(mockResetAnswer).toHaveBeenCalledTimes(2); // Both calls trigger reset
          expect(mockGenerateAnswer).toHaveBeenCalledTimes(1); // Only first call triggers generate
        });
      });

      describe('when the user performs multiple searches in a row', () => {
        it('should reset the answer and generate a new one for each search', () => {
          mockSelectAnswerTriggerParams
            .mockReturnValueOnce({
              q: 'cats',
              requestId: 'search-cats',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            })
            .mockReturnValueOnce({
              q: 'dogs',
              requestId: 'search-dogs',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            })
            .mockReturnValueOnce({
              q: 'birds',
              requestId: 'search-birds',
              cannotAnswer: false,
              analyticsMode: 'legacy',
              actionCause: 'searchboxSubmit',
            });

          listener(); // Search for cats
          listener(); // Search for dogs
          listener(); // Search for birds

          expect(mockResetAnswer).toHaveBeenCalledTimes(3);
          expect(mockGenerateAnswer).toHaveBeenCalledTimes(3);
        });
      });
    });
  });

  describe('building the controller with the next analytics mode', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      engine = buildEngineWithGeneratedAnswer({
        configuration: {
          ...getConfigurationInitialState(),
          analytics: buildMockAnalyticsState({analyticsMode: 'next'}),
        },
      });
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should log a warning when the controller is used with the next analytics mode', () => {
      createGeneratedAnswer();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        '[Warning] A component from the Coveo Headless library has been instantiated with the Analytics Mode: "Next".\n' +
          'However, this mode is not available for Coveo for Service features, and this configuration may not work as expected.\n' +
          'Please switch back to the "legacy" analytics mode to ensure proper functionality.\n' +
          'For more information, refer to the documentation: https://docs.coveo.com/en/o3r90189/build-a-search-ui/event-protocol'
      );
    });
  });

  describe('building the controller with the legacy analytics mode', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      engine = buildEngineWithGeneratedAnswer({
        configuration: {
          ...getConfigurationInitialState(),
          analytics: buildMockAnalyticsState({analyticsMode: 'legacy'}),
        },
      });
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should not log a warning when the controller is used with the legacy analytics mode', () => {
      createGeneratedAnswer();
      expect(warnSpy).toHaveBeenCalledTimes(0);
    });
  });
});
