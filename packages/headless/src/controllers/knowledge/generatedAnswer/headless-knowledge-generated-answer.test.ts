import {answerApi, fetchAnswer} from '../../../api/knowledge/stream-answer-api';
import {
  resetAnswer,
  updateAnswerConfigurationId,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions';
import {generatedAnswerAnalyticsClient} from '../../../features/generated-answer/generated-answer-analytics-actions';
import {
  GeneratedAnswerState,
  getGeneratedAnswerInitialState,
} from '../../../features/generated-answer/generated-answer-state';
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
import {buildKnowledgeGeneratedAnswer} from './headless-knowledge-generated-answer';

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
  };
});

describe('knowledge-generated-answer', () => {
  it('should be tested', () => {
    expect(true).toBe(true);
  });

  let engine: MockedSearchEngine;

  const createGeneratedAnswer = (props: GeneratedAnswerProps = {}) =>
    buildKnowledgeGeneratedAnswer(
      engine,
      generatedAnswerAnalyticsClient,
      props
    );

  const buildEngineWithGeneratedAnswer = (
    initialState: Partial<GeneratedAnswerState> = {}
  ) => {
    const state = createMockState({
      generatedAnswer: {
        ...getGeneratedAnswerInitialState(),
        ...initialState,
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
<<<<<<< HEAD
      query: queryReducer,
=======
>>>>>>> 97b76949d (feat(answer): knowledge answer controller)
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
      answer: undefined,
      answerContentFormat: 'text/plain',
      error: {message: undefined},
    });
  });

  it('dispatches a rephrase action', () => {
    const generatedAnswer = createGeneratedAnswer();
    const responseFormat: GeneratedResponseFormat = {answerStyle: 'step'};
    generatedAnswer.rephrase(responseFormat);
    expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
  });

  it('initialize the format', () => {
    const responseFormat: GeneratedResponseFormat = {answerStyle: 'concise'};
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
});
