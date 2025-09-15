import {skipToken} from '@reduxjs/toolkit/query';
import {answerEvaluation} from '../../../api/knowledge/post-answer-evaluation.js';
import {
  answerApi,
  fetchAnswer,
} from '../../../api/knowledge/stream-answer-api.js';
import type {StreamAnswerAPIState} from '../../../api/knowledge/stream-answer-api-state.js';
import {getConfigurationInitialState} from '../../../features/configuration/configuration-state.js';
import * as answerApiSelectors from '../../../features/generated-answer/answer-api-selectors.js';
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
    selectAnswer: () => ({
      data: {answer: 'This est une answer', answerId: '12345_6'},
    }),
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
    it('triggers a generateAnswer only when there is a request id, a query, an action cause, and the request is made with another request than the last one', () => {
      createGeneratedAnswer();

      const listener = engine.subscribe.mock.calls[0][0];

      // no request id, no call
      listener();
      expect(generateAnswer).not.toHaveBeenCalled();

      // first request id, call
      listener();
      expect(generateAnswer).toHaveBeenCalledTimes(1);

      // same request id, no call
      listener();
      expect(generateAnswer).toHaveBeenCalledTimes(1);

      // empty query, no call
      listener();
      expect(generateAnswer).toHaveBeenCalledTimes(1);

      // new request id, call
      listener();
      expect(generateAnswer).toHaveBeenCalledTimes(2);

      // new query, new request id, legacy mode, no action cause, call
      listener();
      expect(generateAnswer).toHaveBeenCalledTimes(3);

      // new query, new request id, next mode, no action cause, no call
      listener();
      expect(generateAnswer).toHaveBeenCalledTimes(3);

      // new query, new request id, next mode, with action cause, call
      listener();
      expect(generateAnswer).toHaveBeenCalledTimes(4);
    });

    it('re-triggers a generateAnswer after making the same query two times in a row', async () => {
      const originalQueries = [...queries];

      queries.length = 0;
      queries.push(
        {q: '', requestId: ''}, // Initial call
        {q: 'same question', requestId: '100'}, // Second call - first trigger
        {q: 'same question', requestId: '200'} // Third call - same query, different requestId - should trigger
      );

      // Reset counter for this test
      queryCounter.count = 0;

      try {
        createGeneratedAnswer();
        const listener = engine.subscribe.mock.calls[0][0];

        // Initial call
        listener();
        expect(generateAnswer).toHaveBeenCalledTimes(0);

        listener();
        expect(generateAnswer).toHaveBeenCalledTimes(1);

        listener();
        expect(generateAnswer).toHaveBeenCalledTimes(2);
      } finally {
        // Restore original queries array
        queries.length = 0;
        queries.push(...originalQueries);
      }
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
