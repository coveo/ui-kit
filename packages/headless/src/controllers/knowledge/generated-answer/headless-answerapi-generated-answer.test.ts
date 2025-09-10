import {skipToken} from '@reduxjs/toolkit/query';
import {answerEvaluation} from '../../../api/knowledge/post-answer-evaluation.js';
import {
  answerApi,
  fetchAnswer,
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

const queryCounter = {count: 0};
const queries = [
  {q: '', requestId: ''},
  {q: 'this est une question', requestId: '12'},
  {q: 'this est une another question', requestId: '12'},
  {q: '', requestId: '34'},
  {q: 'this est une yet another question', requestId: '56'},
  {
    q: 'this est une question in legacy mode without action cause',
    requestId: '78',
    analyticsMode: 'legacy',
  },
  {
    q: 'this est une question in next mode without action cause',
    requestId: '7822',
    analyticsMode: 'next',
    actionCause: '',
  },
  {
    q: 'this est une question in next mode with an action cause',
    requestId: '781',
    analyticsMode: 'next',
    actionCause: 'searchboxSubmit',
  },
];

vi.mock(
  '../../../features/generated-answer/answer-api-selectors.js',
  async () => {
    const original = await vi.importActual<
      typeof import('../../../features/generated-answer/answer-api-selectors.js')
    >('../../../features/generated-answer/answer-api-selectors.js');

    return {
      ...original,
      selectAnswerTriggerParams: vi.fn(() => {
        const query = {...queries[queryCounter.count]};
        queryCounter.count++;
        return query;
      }),
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
    selectAnswer: () => () => ({
      data: {answer: 'This est une answer', answerId: '12345_6'},
    }),
    selectAnswerTriggerParams: vi.fn(),
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

  it('exposes its state', () => {
    const generatedAnswer = createGeneratedAnswer();

    expect(generatedAnswer.state).toEqual({
      ...engine.state.generatedAnswer,
      answer: 'This est une answer',
      answerContentFormat: 'text/plain',
      error: {message: undefined, statusCode: undefined},
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
    expect(answerEvaluation.endpoints.post.initiate).toHaveBeenCalledTimes(1);
    expect(answerEvaluation.endpoints.post.initiate).toHaveBeenCalledWith(
      expectedArgs
    );
  });

  describe('subscribeToSearchRequest', () => {
    const mockSelectAnswerTriggerParams = vi.mocked(selectAnswerTriggerParams);
    const mockGeneratedAnswer = vi.mocked(generateAnswer);
    let listener: () => void;

    beforeEach(() => {
      vi.clearAllMocks();
      createGeneratedAnswer();
      listener = engine.subscribe.mock.calls[0][0];
    });

    it('should not trigger generatedAnswer when there is no request id', () => {
      mockSelectAnswerTriggerParams.mockReturnValue({
        q: '',
        requestId: '',
        cannotAnswer: false,
        analyticsMode: 'legacy',
        actionCause: 'searchboxSubmit',
      });

      listener();

      expect(mockGeneratedAnswer).not.toHaveBeenCalled();
    });

    describe('when there is a request id and query', () => {
      it('should trigger generateAnswer on first valid request', () => {
        mockSelectAnswerTriggerParams
          .mockReturnValueOnce({
            q: '',
            requestId: '',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          })
          .mockReturnValueOnce({
            q: 'this est une question',
            requestId: '12',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

        listener(); // First call - initializes lastTriggerParams with empty values
        listener(); // Second call - triggers generateAnswer with valid request

        expect(mockGeneratedAnswer).toHaveBeenCalledTimes(1);
      });

      it('should not trigger generateAnswer for the same request id', () => {
        mockSelectAnswerTriggerParams
          .mockReturnValueOnce({
            q: '',
            requestId: '',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          })
          .mockReturnValueOnce({
            q: 'this est une question',
            requestId: '12',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          })
          .mockReturnValueOnce({
            q: 'this est une another question',
            requestId: '12',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

        listener(); // First call - initialization
        listener(); // Second call - first valid request with id '12'
        listener(); // Third call - same request id '12', should not trigger

        expect(mockGeneratedAnswer).toHaveBeenCalledTimes(1);
      });

      it('should trigger generateAnswer for new request id', () => {
        mockSelectAnswerTriggerParams
          .mockReturnValueOnce({
            q: '',
            requestId: '',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          })
          .mockReturnValueOnce({
            q: 'this est une question',
            requestId: '12',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          })
          .mockReturnValueOnce({
            q: 'this est une yet another question',
            requestId: '56',
            cannotAnswer: false,
            analyticsMode: 'legacy',
            actionCause: 'searchboxSubmit',
          });

        listener(); // First call - initialization
        listener(); // Second call - first valid request with id '12'
        listener(); // Third call - new request id '56'

        expect(mockGeneratedAnswer).toHaveBeenCalledTimes(2);
      });
    });

    it('should not trigger generateAnswer even with new request id when query is empty', () => {
      mockSelectAnswerTriggerParams
        .mockReturnValueOnce({
          q: '',
          requestId: '',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: 'searchboxSubmit',
        })
        .mockReturnValueOnce({
          q: 'this est une question',
          requestId: '12',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: 'searchboxSubmit',
        })
        .mockReturnValueOnce({
          q: '',
          requestId: '34',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: 'searchboxSubmit',
        });

      listener(); // First call - initialization
      listener(); // Second call with valid query
      listener(); // Third call with empty query but new request id

      expect(mockGeneratedAnswer).toHaveBeenCalledTimes(1);
    });

    it('should trigger generateAnswer when in legacy mode without action cause', () => {
      mockSelectAnswerTriggerParams
        .mockReturnValueOnce({
          q: '',
          requestId: '',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: 'searchboxSubmit',
        })
        .mockReturnValueOnce({
          q: 'this est une question in legacy mode without action cause',
          requestId: '78',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: undefined,
        });

      listener(); // First call - initialization
      listener(); // Second call - legacy mode without action cause

      expect(mockGeneratedAnswer).toHaveBeenCalledTimes(1);
    });

    it('should not trigger generateAnswer when in next mode without action cause', () => {
      mockSelectAnswerTriggerParams.mockReturnValue({
        q: 'this est une question in next mode without action cause',
        requestId: '7822',
        cannotAnswer: false,
        analyticsMode: 'next',
        actionCause: '',
      });

      listener(); // This should not trigger due to next mode without action cause

      expect(mockGeneratedAnswer).not.toHaveBeenCalled();
    });

    it('should trigger generateAnswer when in next mode with action cause', () => {
      mockSelectAnswerTriggerParams
        .mockReturnValueOnce({
          q: '',
          requestId: '',
          cannotAnswer: false,
          analyticsMode: 'next',
          actionCause: 'searchboxSubmit',
        })
        .mockReturnValueOnce({
          q: 'this est une question in next mode with an action cause',
          requestId: '781',
          cannotAnswer: false,
          analyticsMode: 'next',
          actionCause: 'searchboxSubmit',
        });

      listener(); // First call - initialization
      listener(); // Second call - next mode with action cause

      expect(mockGeneratedAnswer).toHaveBeenCalledTimes(1);
    });

    it('should trigger generateAnswer for same query with different request id', () => {
      mockSelectAnswerTriggerParams
        .mockReturnValueOnce({
          q: '',
          requestId: '',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: 'searchboxSubmit',
        })
        .mockReturnValueOnce({
          q: 'same question',
          requestId: '100',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: 'searchboxSubmit',
        })
        .mockReturnValueOnce({
          q: 'same question',
          requestId: '200',
          cannotAnswer: false,
          analyticsMode: 'legacy',
          actionCause: 'searchboxSubmit',
        });

      listener(); // First call - initialization
      listener(); // Second call - first occurrence of query with id '100'
      listener(); // Third call - same query but different id '200', should trigger again

      expect(mockGeneratedAnswer).toHaveBeenCalledTimes(2);
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
