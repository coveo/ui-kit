import {TestUtils} from '../..';
import {
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  resetAnswer,
  setIsVisible,
  streamAnswer,
  updateResponseFormat,
} from '../../features/generated-answer/generated-answer-actions';
import {
  logCopyGeneratedAnswer,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logGeneratedAnswerHideAnswers,
  logGeneratedAnswerShowAnswers,
  logHoverCitation,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
} from '../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer} from '../../features/generated-answer/generated-answer-slice';
import {
  GeneratedAnswerState,
  getGeneratedAnswerInitialState,
} from '../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../features/search/search-actions';
import {buildMockCitation} from '../../test/mock-citation';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {
  buildGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-generated-answer';

describe('generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockSearchEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildGeneratedAnswer(engine, props);
  }

  function findAction(actionType: string) {
    return engine.actions.find((a) => a.type === actionType);
  }

  function buildEngineWithGeneratedAnswer(
    initialState: Partial<GeneratedAnswerState> = {}
  ) {
    const mockState = TestUtils.createMockState();
    return buildMockSearchAppEngine({
      state: {
        ...mockState,
        generatedAnswer: {
          ...mockState.generatedAnswer,
          ...initialState,
        },
      },
    });
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

  it('should subscribe to state updates', () => {
    expect(engine.subscribe).toHaveBeenCalledTimes(1);
  });

  it('should return the state', () => {
    expect(generatedAnswer.state).toEqual(getGeneratedAnswerInitialState());
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
  it('#like dispatches no analytics action when #liked is set to true', () => {
    engine.state.generatedAnswer.liked = true;
    generatedAnswer.like();
    const action = findAction(likeGeneratedAnswer.type);
    const analyticsAction = engine.findAsyncAction(
      logLikeGeneratedAnswer().pending
    );

    expect(action).not.toBeTruthy();
    expect(analyticsAction).not.toBeTruthy();
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

  it('#dislike dispatches no analytics action when #disliked is set to true', () => {
    engine.state.generatedAnswer.disliked = true;
    generatedAnswer.dislike();
    const action = findAction(likeGeneratedAnswer.type);
    const analyticsAction = engine.findAsyncAction(
      logLikeGeneratedAnswer().pending
    );

    expect(action).not.toBeTruthy();
    expect(analyticsAction).not.toBeTruthy();
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

  it('#logCitationHover dispatches analytics action', () => {
    const testCitation = buildMockCitation();
    const exampleDuration = 100;

    generatedAnswer.logCitationHover(testCitation.id, exampleDuration);
    const action = engine.findAsyncAction(
      logHoverCitation(testCitation.id, exampleDuration).pending
    );

    expect(action).toBeTruthy();
  });

  it('#logCopyToClipboard dispatches analytics action', () => {
    generatedAnswer.logCopyToClipboard();

    const analyticsAction = engine.findAsyncAction(
      logCopyGeneratedAnswer().pending
    );

    expect(analyticsAction).toBeDefined();
  });

  describe('#rephrase', () => {
    const responseFormat: GeneratedResponseFormat = {
      answerStyle: 'concise',
    };

    it('dispatches the update action', () => {
      generatedAnswer.rephrase(responseFormat);

      const action = findAction(updateResponseFormat.type);
      expect(action).toBeDefined();
      expect(action).toHaveProperty('payload', responseFormat);
    });

    it('dispatches #executeSearch', () => {
      generatedAnswer.rephrase(responseFormat);

      const action = engine.findAsyncAction(executeSearch.pending);

      expect(action).toBeTruthy();
    });
  });

  describe('when passing initial state', () => {
    describe('when #isVisible is set', () => {
      it('should dispatch setIsVisible action when set to true', () => {
        initGeneratedAnswer({initialState: {isVisible: true}});

        const action = findAction(setIsVisible.type);
        expect(action).toBeDefined();
        expect(action).toHaveProperty('payload', true);
      });

      it('should dispatch setIsVisible action when set to false', () => {
        initGeneratedAnswer({initialState: {isVisible: false}});

        const action = findAction(setIsVisible.type);
        expect(action).toBeDefined();
        expect(action).toHaveProperty('payload', false);
      });
    });

    describe('when #responseFormat is set', () => {
      it('should dispatch updateResponseFormat action', () => {
        const responseFormat: GeneratedResponseFormat = {
          answerStyle: 'concise',
        };
        initGeneratedAnswer({initialState: {responseFormat}});

        const action = findAction(updateResponseFormat.type);
        expect(action).toBeDefined();
        expect(action).toHaveProperty('payload', responseFormat);
      });
    });
  });

  describe('subscription to changes', () => {
    function callListener() {
      return (engine.subscribe as jest.Mock).mock.calls
        .map((args) => args[0])
        .forEach((listener) => {
          listener();
        });
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

    describe('when we have multiple controllers', () => {
      let secondEngine: MockSearchEngine;

      beforeEach(() => {
        secondEngine = buildMockSearchAppEngine();
        buildGeneratedAnswer(secondEngine);
      });

      it('should dispatch the stream action only once', () => {
        engine.state.search.extendedResults = {
          generativeQuestionAnsweringId: 'another-fake-test-id',
        };

        callListener();

        const count = engine.actions.filter(
          (a) => a.type === streamAnswer.pending.type
        ).length;
        expect(count).toEqual(1);
      });
    });
  });

  describe('#show', () => {
    describe('when already visible', () => {
      it('should not make any changes', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: true});
        initGeneratedAnswer();

        generatedAnswer.show();

        const action = findAction(setIsVisible.type);
        expect(action).toBeUndefined();
      });
    });

    describe('when not visible', () => {
      it('should dispatch the setIsVisible action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: false});
        initGeneratedAnswer();

        generatedAnswer.show();

        const action = findAction(setIsVisible.type);
        expect(action).toBeDefined();
        expect(action).toHaveProperty('payload', true);
      });

      it('should dispatch the analytics action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: false});
        initGeneratedAnswer();

        generatedAnswer.show();

        const analyticsAction = findAction(
          logGeneratedAnswerShowAnswers().pending.type
        );
        expect(analyticsAction).toBeDefined();
      });
    });
  });

  describe('#hide', () => {
    describe('when not visible', () => {
      it('should not make any changes', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: false});
        initGeneratedAnswer();

        generatedAnswer.hide();

        const action = findAction(setIsVisible.type);
        expect(action).toBeUndefined();
      });
    });

    describe('when visible', () => {
      it('should dispatch the setIsVisible action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: true});
        initGeneratedAnswer();

        generatedAnswer.hide();

        const action = findAction(setIsVisible.type);
        expect(action).toBeDefined();
        expect(action).toHaveProperty('payload', false);
      });

      it('should dispatch the analytics action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: true});
        initGeneratedAnswer();

        generatedAnswer.hide();

        const analyticsAction = findAction(
          logGeneratedAnswerHideAnswers().pending.type
        );
        expect(analyticsAction).toBeDefined();
      });
    });
  });
});
