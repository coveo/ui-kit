import {answerEvaluation} from '../../../api/knowledge/post-answer-evaluation.js';
import {
  answerApi,
  fetchAnswer,
  StateNeededByAnswerAPI,
} from '../../../api/knowledge/stream-answer-api.js';
import {
  resetAnswer,
  updateAnswerConfigurationId,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions.js';
import {
  generatedAnswerAnalyticsClient,
  GeneratedAnswerFeedback,
} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {getGeneratedAnswerInitialState} from '../../../features/generated-answer/generated-answer-state.js';
import {queryReducer} from '../../../features/query/query-slice.js';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../generated-answer/headless-generated-answer.js';
import {buildAnswerApiGeneratedAnswer} from './headless-answerapi-generated-answer.js';

vi.mock('../../../features/generated-answer/generated-answer-actions');
vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);
vi.mock('../../../features/search/search-actions');

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
    it('triggers a fetchAnswer only when there is a request id, a query, and the request is made with another request than the last one', () => {
      createGeneratedAnswer();

      const listener = engine.subscribe.mock.calls[0][0];

      // no request id, no call
      listener();
      expect(fetchAnswer).not.toHaveBeenCalled();

      // first request id, call
      listener();
      expect(fetchAnswer).toHaveBeenCalledTimes(1);

      // same request id, no call
      listener();
      expect(fetchAnswer).toHaveBeenCalledTimes(1);

      // empty query, no call
      listener();
      expect(fetchAnswer).toHaveBeenCalledTimes(1);

      // new request id, call
      listener();
      expect(fetchAnswer).toHaveBeenCalledTimes(2);
    });
  });
});
