import {answerEvaluation} from '../../../api/knowledge/post-answer-evaluation';
import {
  answerApi,
  fetchAnswer,
  StateNeededByAnswerAPI,
} from '../../../api/knowledge/stream-answer-api';
import {
  resetAnswer,
  updateAnswerConfigurationId,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions';
import {
  generatedAnswerAnalyticsClient,
  GeneratedAnswerFeedback,
} from '../../../features/generated-answer/generated-answer-analytics-actions';
import {getGeneratedAnswerInitialState} from '../../../features/generated-answer/generated-answer-state';
import {queryReducer} from '../../../features/query/query-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../generated-answer/headless-generated-answer';
import {buildAnswerApiGeneratedAnswer} from './headless-answerapi-generated-answer';

jest.mock('../../../features/generated-answer/generated-answer-actions');
jest.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);
jest.mock('../../../features/search/search-actions');
jest.mock('../../../api/knowledge/stream-answer-api', () => {
  const originalStreamAnswerApi = jest.requireActual(
    '../../../api/knowledge/stream-answer-api'
  );
  return {
    ...originalStreamAnswerApi,
    fetchAnswer: jest.fn(),
    selectAnswer: () => ({
      data: {answer: 'This est une answer', answerId: '12345_6'},
    }),
  };
});
jest.mock('../../../api/knowledge/post-answer-evaluation', () => ({
  answerEvaluation: {
    endpoints: {
      post: {
        initiate: jest.fn(),
      },
    },
  },
}));

describe('knowledge-generated-answer', () => {
  it('should be tested', () => {
    expect(true).toBe(true);
  });

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
    jest.clearAllMocks();
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
});
