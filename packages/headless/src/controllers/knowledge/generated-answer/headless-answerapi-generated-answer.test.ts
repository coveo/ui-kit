/** biome-ignore-all lint/suspicious/noExplicitAny: Just tests */
import {answerEvaluation} from '../../../api/knowledge/post-answer-evaluation.js';
import {triggerSearchRequest} from '../../../api/knowledge/stream-answer-actions.js';
import {
  answerApi,
  fetchAnswer,
  type StateNeededByAnswerAPI,
} from '../../../api/knowledge/stream-answer-api.js';
import {getConfigurationInitialState} from '../../../features/configuration/configuration-state.js';
import {
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
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {createMockState} from '../../../test/mock-state.js';
import type {
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../generated-answer/headless-generated-answer.js';
import {
  buildAnswerApiGeneratedAnswer,
  constructAnswerQueryParams,
} from './headless-answerapi-generated-answer.js';
import {
  expectedStreamAnswerAPIParam,
  expectedStreamAnswerAPIParamForSelect,
  expectedStreamAnswerAPIParamWithATabWithAnExpression,
  expectedStreamAnswerAPIParamWithoutAnyTab,
  expectedStreamAnswerAPIParamWithoutSearchAction,
  expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpression,
  expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpressionWithoutAdvancedCQ,
  expectedStreamAnswerAPIParamWithStaticFiltersSelected,
  streamAnswerAPIStateMock,
  streamAnswerAPIStateMockWithATabWithAnExpression,
  streamAnswerAPIStateMockWithNonValidFilters,
  streamAnswerAPIStateMockWithoutAnyFilters,
  streamAnswerAPIStateMockWithoutAnyTab,
  streamAnswerAPIStateMockWithoutSearchAction,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpression,
  streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ,
  streamAnswerAPIStateMockWithStaticFiltersSelected,
} from './headless-answerapi-generated-answer-mocks.js';

vi.mock('../../../features/generated-answer/generated-answer-actions');
vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);
vi.mock('../../../features/search/search-actions');
vi.mock('../../../api/knowledge/stream-answer-actions.js');

vi.mock('../../../api/knowledge/stream-answer-api', async () => {
  const originalStreamAnswerApi = await vi.importActual(
    '../../../api/knowledge/stream-answer-api'
  );
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
  return {
    ...originalStreamAnswerApi,
    fetchAnswer: vi.fn(),
    selectAnswer: () => ({
      data: {answer: 'This est une answer', answerId: '12345_6'},
    }),
    selectAnswerTriggerParams: () => {
      const query = {...queries[queryCounter.count]};
      queryCounter.count++;
      return query;
    },
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
    initialState: Partial<StateNeededByAnswerAPI> = {}
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

  it('dispatches a retry action', () => {
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
    it('triggers a triggerSearchRequest only when there is a request id, a query, an action cause, and the request is made with another request than the last one', () => {
      createGeneratedAnswer();

      const listener = engine.subscribe.mock.calls[0][0];

      // no request id, no call
      listener();
      expect(triggerSearchRequest).not.toHaveBeenCalled();

      // first request id, call
      listener();
      expect(triggerSearchRequest).toHaveBeenCalledTimes(1);

      // same request id, no call
      listener();
      expect(triggerSearchRequest).toHaveBeenCalledTimes(1);

      // empty query, no call
      listener();
      expect(triggerSearchRequest).toHaveBeenCalledTimes(1);

      // new request id, call
      listener();
      expect(triggerSearchRequest).toHaveBeenCalledTimes(2);

      // new query, new request id, legacy mode, no action cause, call
      listener();
      expect(triggerSearchRequest).toHaveBeenCalledTimes(3);

      // new query, new request id, next mode, no action cause, no call
      listener();
      expect(triggerSearchRequest).toHaveBeenCalledTimes(3);

      // new query, new request id, next mode, with action cause, call
      listener();
      expect(triggerSearchRequest).toHaveBeenCalledTimes(4);
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

  describe.skip('constructAnswerQueryParams', () => {
    beforeEach(() => {
      vi.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    });
    afterAll(() => {
      vi.useRealTimers();
    });

    it('returns the correct query params with fetch usage', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should create the right selector when usage is select', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'select',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParamForSelect);
    });

    it('should merge tab expression in request constant query when expression is not a blank string', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithATabWithAnExpression as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithATabWithAnExpression
      );
    });

    it('should not include tab info when there is NO tab', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithoutAnyTab as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParamWithoutAnyTab);
    });

    it('should merge filter expressions in request constant query when expression is selected', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersSelected as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithStaticFiltersSelected
      );
    });

    it('should not include filter info when there is NO filter', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithoutAnyFilters as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should not include non-selected filters and empty filters', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithNonValidFilters as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);
    });

    it('should merge multiple filter expressions and a tab expression', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersAndTabExpression as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpression
      );
    });

    it('should not include advanced search queries when there are no advanced search queries', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );
      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithStaticFiltersAndTabExpressionWithoutAdvancedCQ
      );
    });

    it('should accept an undefined SearchAction', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMockWithoutSearchAction as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(
        expectedStreamAnswerAPIParamWithoutSearchAction
      );
    });

    it('should exclude analytics fields when usage is select', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'select',
        buildMockNavigatorContextProvider()()
      );

      // Verify that volatile fields (clientTimestamp, actionCause) are not present
      expect(queryParams.analytics).toBeUndefined();
    });

    it('should include all analytics fields when usage is fetch', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      // Verify that all analytics fields are present including volatile ones
      expect(queryParams.analytics).toBeDefined();
      expect(queryParams.analytics?.clientTimestamp).toBeDefined();
      expect(queryParams.analytics?.actionCause).toBeDefined();
      expect(queryParams.analytics?.capture).toBeDefined();
      expect(queryParams.analytics?.clientId).toBeDefined();
      expect(queryParams.analytics?.originContext).toBeDefined();
    });

    // biome-ignore lint/suspicious/noFocusedTests: will fix in a later commit
    it.only('should build the correct facets times for the query params', () => {
      const queryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'fetch',
        buildMockNavigatorContextProvider()()
      );

      expect(queryParams).toEqual(expectedStreamAnswerAPIParam);

      const updatedQueryParams = constructAnswerQueryParams(
        streamAnswerAPIStateMock as any,
        'select',
        buildMockNavigatorContextProvider()()
      );

      expect(updatedQueryParams).not.toEqual(
        expectedStreamAnswerAPIParamWithDifferentFacetTimes
      );
    });
  });
});
