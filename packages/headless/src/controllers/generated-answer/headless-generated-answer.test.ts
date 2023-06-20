import {generatedAnswerReducer} from '../../features/generated-answer/generated-answer-slice';
import {getGeneratedAnswerInitialState} from '../../features/generated-answer/generated-answer-state';
import {executeSearch} from '../../features/search/search-actions';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
} from './headless-generated-answer';

describe('generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockSearchEngine;

  function initGeneratedAnswer() {
    generatedAnswer = buildGeneratedAnswer(engine);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initGeneratedAnswer();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      generatedAnswer: generatedAnswerReducer,
    });
  });

  it('should return the state', () => {
    expect(generatedAnswer.state).toEqual(getGeneratedAnswerInitialState());
  });

  it('should subscribe to state updates', () => {
    expect(engine.subscribe).toHaveBeenCalledTimes(1);
  });

  it('#retry dispatches #executeSearch', () => {
    generatedAnswer.retry();
    const action = engine.findAsyncAction(executeSearch.pending);
    expect(action).toBeTruthy();
  });
});
