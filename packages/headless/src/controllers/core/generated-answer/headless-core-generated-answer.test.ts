import {TestUtils} from '../../..';
import {
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  sendGeneratedAnswerFeedback,
  setIsVisible,
  updateResponseFormat,
  registerFieldsToIncludeInCitations,
} from '../../../features/generated-answer/generated-answer-actions';
import {
  generatedAnswerAnalyticsClient,
  logCopyGeneratedAnswer,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logGeneratedAnswerHideAnswers,
  logGeneratedAnswerShowAnswers,
  logHoverCitation,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
} from '../../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer} from '../../../features/generated-answer/generated-answer-slice';
import {
  GeneratedAnswerState,
  getGeneratedAnswerInitialState,
} from '../../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format';
import {buildMockCitation} from '../../../test/mock-citation';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  buildCoreGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-core-generated-answer';

describe('generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockInsightEngine;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildCoreGeneratedAnswer(
      engine,
      generatedAnswerAnalyticsClient,
      props
    );
  }

  function findAction(actionType: string) {
    return engine.actions.find((a) => a.type === actionType);
  }

  function buildEngineWithGeneratedAnswer(
    initialState: Partial<GeneratedAnswerState> = {}
  ) {
    const mockState = TestUtils.createMockState();
    return buildMockInsightEngine({
      state: {
        ...buildMockInsightState(),
        generatedAnswer: {
          ...mockState.generatedAnswer,
          ...initialState,
        },
      },
    });
  }

  beforeEach(() => {
    engine = buildMockInsightEngine();
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
    const action = findAction(dislikeGeneratedAnswer.type);
    const analyticsAction = engine.findAsyncAction(
      logDislikeGeneratedAnswer().pending
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
    const action = findAction(sendGeneratedAnswerFeedback.type);
    const analyticsAction = engine.findAsyncAction(
      logGeneratedAnswerFeedback(exampleFeedback).pending
    );

    expect(action).toBeTruthy();
    expect(analyticsAction).toBeTruthy();
  });

  it('#sendDetailedFeedback dispatches the right actions', () => {
    const exampleDetails = 'Example details';
    generatedAnswer.sendDetailedFeedback(exampleDetails);
    const action = findAction(sendGeneratedAnswerFeedback.type);
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

  describe('when passing fields to include in citations', () => {
    it('should dispatch registerFieldsToIncludeInCitations to register the fields to include in citations', () => {
      const exampleFieldsToIncludeInCitations = ['foo', 'bar'];

      initGeneratedAnswer({
        fieldsToIncludeInCitations: exampleFieldsToIncludeInCitations,
      });

      const action = findAction(registerFieldsToIncludeInCitations.type);
      expect(action).toBeDefined();
      expect(action).toHaveProperty(
        'payload',
        exampleFieldsToIncludeInCitations
      );
    });
  });
});
