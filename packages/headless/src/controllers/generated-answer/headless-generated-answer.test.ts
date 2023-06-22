import {
  resetAnswer,
  streamAnswer,
} from '../../features/generated-answer/generated-answer-actions';
import {
  logDislikeGeneratedAnswer,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
} from '../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer} from '../../features/generated-answer/generated-answer-slice';
import {getGeneratedAnswerInitialState} from '../../features/generated-answer/generated-answer-state';
import {executeSearch} from '../../features/search/search-actions';
import {buildMockCitation} from '../../test/mock-citation';
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

  it('#likeGeneratedAnswer dispatches analytics action', () => {
    generatedAnswer.like();
    const action = engine.findAsyncAction(logLikeGeneratedAnswer().pending);

    expect(action).toBeTruthy();
  });

  it('#dislikeGeneratedAnswer dispatches analytics action', () => {
    generatedAnswer.dislike();
    const action = engine.findAsyncAction(logDislikeGeneratedAnswer().pending);

    expect(action).toBeTruthy();
  });

  it('#logCitationClick dispatches analytics action', () => {
    const testCitation = buildMockCitation();

    generatedAnswer.logCitationClick(testCitation.id);
    const action = engine.findAsyncAction(
      logOpenGeneratedAnswerSource(testCitation.id).pending
    );

    expect(action).toBeTruthy();
  });

  describe('subscription to changes', () => {
    function callListener() {
      return (engine.subscribe as jest.Mock).mock.calls.map(
        (args) => args[0]
      )[0]();
    }

    it('should not dispatch the stream action when there is no stream ID', () => {
      callListener();

      const action = engine.actions.find(
        (a) => a.type === streamAnswer.pending.type
      );

      expect(action).toBeFalsy();
    });

    it('should dispatch the resetAnswer action when the requestId has changed', () => {
      engine.state.search.requestId = 'some-fake-test-id';

      callListener();

      const action = engine.actions.find((a) => a.type === resetAnswer.type);

      expect(action).toBeTruthy();
    });

    it('should dispatch the stream action when there is a new stream ID', () => {
      engine.state.search.extendedResults = {
        generativeQuestionAnsweringId: 'some-fake-test-id',
      };

      callListener();

      const action = engine.actions.find(
        (a) => a.type === streamAnswer.pending.type
      );

      expect(action).toBeTruthy();
    });
  });
});
