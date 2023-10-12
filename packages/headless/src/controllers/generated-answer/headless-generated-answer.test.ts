import {
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  resetAnswer,
  streamAnswer,
} from '../../features/generated-answer/generated-answer-actions';
import {
  logDislikeGeneratedAnswer,
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
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

  function findAction(actionType: string) {
    return engine.actions.find((a) => a.type === actionType);
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

  it('#like dispatches analytics action', () => {
    generatedAnswer.like();
    const action = findAction(likeGeneratedAnswer.type);
    const analyticsAction = engine.findAsyncAction(
      logLikeGeneratedAnswer().pending
    );

    expect(action).toBeTruthy();
    expect(analyticsAction).toBeTruthy();
  });

  it('#dislike dispatches analytics action', () => {
    generatedAnswer.dislike();
    const action = findAction(dislikeGeneratedAnswer.type);
    const analyticsAction = engine.findAsyncAction(
      logDislikeGeneratedAnswer().pending
    );

    expect(action).toBeTruthy();
    expect(analyticsAction).toBeTruthy();
  });

  it('#openFeedbackModal dispatches the right actions', () => {
    generatedAnswer.openFeedbackModal();
    const action = findAction(openGeneratedAnswerFeedbackModal.type);

    expect(action).toBeTruthy();
  });

  it('#closeFeedbackModal dispatches the right actions', () => {
    generatedAnswer.closeFeedbackModal();
    const action = findAction(closeGeneratedAnswerFeedbackModal.type);

    expect(action).toBeTruthy();
  });

  it('#sendFeedback dispatches the right actions', () => {
    const exampleFeedback = 'notAccurate';
    generatedAnswer.sendFeedback(exampleFeedback);
    const action = findAction(closeGeneratedAnswerFeedbackModal.type);
    const analyticsAction = engine.findAsyncAction(
      logGeneratedAnswerFeedback(exampleFeedback).pending
    );

    expect(action).toBeTruthy();
    expect(analyticsAction).toBeTruthy();
  });

  it('#sendDetailedFeedback dispatches the right actions', () => {
    const exampleDetails = 'Example details';
    generatedAnswer.sendDetailedFeedback(exampleDetails);
    const action = findAction(closeGeneratedAnswerFeedbackModal.type);
    const analyticsAction = engine.findAsyncAction(
      logGeneratedAnswerDetailedFeedback(exampleDetails).pending
    );

    expect(action).toBeTruthy();
    expect(analyticsAction).toBeTruthy();
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

      const action = findAction(streamAnswer.pending.type);

      expect(action).toBeFalsy();
    });

    it('should dispatch the resetAnswer action when the requestId has changed', () => {
      engine.state.search.requestId = 'some-fake-test-id';

      callListener();

      const action = findAction(resetAnswer.type);

      expect(action).toBeTruthy();
    });

    it('should dispatch the stream action when there is a new stream ID', () => {
      engine.state.search.extendedResults = {
        generativeQuestionAnsweringId: 'some-fake-test-id',
      };

      callListener();

      const action = findAction(streamAnswer.pending.type);

      expect(action).toBeTruthy();
    });
  });
});
