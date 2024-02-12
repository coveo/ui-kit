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
import {SearchAppState} from '../../../state/search-app-state';
import {buildMockCitation} from '../../../test/mock-citation';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {
  buildCoreGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerProps,
} from './headless-core-generated-answer';

jest.mock('../../../features/generated-answer/generated-answer-actions');
jest.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);

describe('generated answer', () => {
  let generatedAnswer: GeneratedAnswer;
  let engine: MockedSearchEngine;
  let state: SearchAppState;

  function initGeneratedAnswer(props: GeneratedAnswerProps = {}) {
    generatedAnswer = buildCoreGeneratedAnswer(
      engine,
      generatedAnswerAnalyticsClient,
      props
    );
  }

  function buildEngineWithGeneratedAnswer(
    initialState: Partial<GeneratedAnswerState> = {}
  ) {
    state = createMockState({
      generatedAnswer: {
        ...getGeneratedAnswerInitialState(),
        ...initialState,
      },
    });
    return buildMockSearchEngine(state);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    engine = buildEngineWithGeneratedAnswer();
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
    expect(likeGeneratedAnswer).toHaveBeenCalled();
    expect(logLikeGeneratedAnswer).toHaveBeenCalled();
  });

  it('#like dispatches no analytics action when #liked is set to true', () => {
    engine = buildEngineWithGeneratedAnswer({liked: true});
    initGeneratedAnswer();

    generatedAnswer.like();
    expect(likeGeneratedAnswer).not.toHaveBeenCalled();
    expect(logLikeGeneratedAnswer).not.toHaveBeenCalled();
  });

  it('#dislike dispatches analytics action', () => {
    generatedAnswer.dislike();
    expect(dislikeGeneratedAnswer).toHaveBeenCalled();
    expect(logDislikeGeneratedAnswer).toHaveBeenCalled();
  });

  it('#dislike dispatches no analytics action when #disliked is set to true', () => {
    engine = buildEngineWithGeneratedAnswer({disliked: true});
    initGeneratedAnswer();
    generatedAnswer.dislike();
    expect(dislikeGeneratedAnswer).not.toHaveBeenCalled();
    expect(logDislikeGeneratedAnswer).not.toHaveBeenCalled();
  });

  it('#openFeedbackModal dispatches the right actions', () => {
    generatedAnswer.openFeedbackModal();
    expect(openGeneratedAnswerFeedbackModal).toHaveBeenCalled();
  });

  it('#closeFeedbackModal dispatches the right actions', () => {
    generatedAnswer.closeFeedbackModal();
    expect(closeGeneratedAnswerFeedbackModal).toHaveBeenCalled();
  });

  it('#sendFeedback dispatches the right actions', () => {
    const exampleFeedback = 'notAccurate';
    generatedAnswer.sendFeedback(exampleFeedback);
    expect(sendGeneratedAnswerFeedback).toHaveBeenCalled();
    expect(logGeneratedAnswerFeedback).toHaveBeenCalledWith(exampleFeedback);
  });

  it('#sendDetailedFeedback dispatches the right actions', () => {
    const exampleDetails = 'Example details';
    generatedAnswer.sendDetailedFeedback(exampleDetails);
    expect(sendGeneratedAnswerFeedback).toHaveBeenCalled();
    expect(logGeneratedAnswerDetailedFeedback).toHaveBeenCalledWith(
      exampleDetails
    );
  });

  it('#logCitationClick dispatches analytics action', () => {
    const testCitation = buildMockCitation();
    generatedAnswer.logCitationClick(testCitation.id);
    expect(logOpenGeneratedAnswerSource).toHaveBeenCalledWith(testCitation.id);
  });

  it('#logCitationHover dispatches analytics action', () => {
    const testCitation = buildMockCitation();
    const exampleDuration = 100;

    generatedAnswer.logCitationHover(testCitation.id, exampleDuration);
    expect(logHoverCitation).toHaveBeenCalledWith(
      testCitation.id,
      exampleDuration
    );
  });

  it('#logCopyToClipboard dispatches analytics action', () => {
    generatedAnswer.logCopyToClipboard();
    expect(logCopyGeneratedAnswer).toHaveBeenCalled();
  });

  describe('#show', () => {
    describe('when already visible', () => {
      it('should not make any changes', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: true});
        initGeneratedAnswer();

        generatedAnswer.show();
        expect(setIsVisible).not.toHaveBeenCalled();
      });
    });

    describe('when not visible', () => {
      it('should dispatch the setIsVisible action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: false});
        initGeneratedAnswer();

        generatedAnswer.show();

        expect(setIsVisible).toHaveBeenCalledWith(true);
      });

      it('should dispatch the analytics action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: false});
        initGeneratedAnswer();

        generatedAnswer.show();
        expect(logGeneratedAnswerShowAnswers).toHaveBeenCalled();
      });
    });
  });

  describe('#hide', () => {
    describe('when not visible', () => {
      it('should not make any changes', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: false});
        initGeneratedAnswer();

        generatedAnswer.hide();
        expect(setIsVisible).not.toHaveBeenCalled();
      });
    });

    describe('when visible', () => {
      it('should dispatch the setIsVisible action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: true});
        initGeneratedAnswer();

        generatedAnswer.hide();
        expect(setIsVisible).toHaveBeenCalledWith(false);
      });

      it('should dispatch the analytics action', () => {
        engine = buildEngineWithGeneratedAnswer({isVisible: true});
        initGeneratedAnswer();

        generatedAnswer.hide();
        expect(logGeneratedAnswerHideAnswers).toHaveBeenCalled();
      });
    });
  });

  describe('when passing initial state', () => {
    describe('when #isVisible is set', () => {
      it('should dispatch setIsVisible action when set to true', () => {
        initGeneratedAnswer({initialState: {isVisible: true}});

        expect(setIsVisible).toHaveBeenCalledWith(true);
      });

      it('should dispatch setIsVisible action when set to false', () => {
        initGeneratedAnswer({initialState: {isVisible: false}});
        expect(setIsVisible).toHaveBeenCalledWith(false);
      });
    });

    describe('when #responseFormat is set', () => {
      it('should dispatch updateResponseFormat action', () => {
        const responseFormat: GeneratedResponseFormat = {
          answerStyle: 'concise',
        };
        initGeneratedAnswer({initialState: {responseFormat}});
        expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
      });
    });
  });

  describe('when passing fields to include in citations', () => {
    it('should dispatch registerFieldsToIncludeInCitations to register the fields to include in citations', () => {
      const exampleFieldsToIncludeInCitations = ['foo', 'bar'];

      initGeneratedAnswer({
        fieldsToIncludeInCitations: exampleFieldsToIncludeInCitations,
      });
      expect(registerFieldsToIncludeInCitations).toHaveBeenCalledWith(
        exampleFieldsToIncludeInCitations
      );
    });
  });
});
