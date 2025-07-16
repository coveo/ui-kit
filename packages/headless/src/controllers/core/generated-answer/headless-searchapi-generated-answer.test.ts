/** biome-ignore-all lint/suspicious/noExplicitAny: Just tests */
import {
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  registerFieldsToIncludeInCitations,
  resetAnswer,
  sendGeneratedAnswerFeedback,
  setIsVisible,
  streamAnswer,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions.js';
import {
  type GeneratedAnswerFeedback,
  generatedAnswerAnalyticsClient,
} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {
  type GeneratedAnswerState,
  getGeneratedAnswerInitialState,
} from '../../../features/generated-answer/generated-answer-state.js';
import {executeSearch} from '../../../features/search/search-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import type {
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../generated-answer/headless-generated-answer.js';
import {
  buildSearchAPIGeneratedAnswer,
  subscribeStateManager,
} from './headless-searchapi-generated-answer.js';

vi.mock('../../../features/generated-answer/generated-answer-actions');
vi.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);
vi.mock('../../../features/search/search-actions');

describe('searchapi-generated-answer', () => {
  let engine: MockedSearchEngine;

  const createGeneratedAnswer = (props: GeneratedAnswerProps = {}) =>
    buildSearchAPIGeneratedAnswer(
      engine as any,
      generatedAnswerAnalyticsClient,
      props
    );

  function buildEngineWithGeneratedAnswer(
    initialState: Partial<GeneratedAnswerState> = {}
  ) {
    const state = createMockState({
      generatedAnswer: {
        ...getGeneratedAnswerInitialState(),
        ...initialState,
      },
    });
    return buildMockSearchEngine(state);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    engine = buildEngineWithGeneratedAnswer();
  });

  it('initializes', () => {
    const generatedAnswer = createGeneratedAnswer();
    expect(generatedAnswer).toBeTruthy();
  });

  it('should subscribe to state updates', () => {
    createGeneratedAnswer();
    expect(engine.subscribe).toHaveBeenCalledTimes(1);
  });

  it('exposes its state', () => {
    const generatedAnswer = createGeneratedAnswer();
    expect(generatedAnswer.state).toEqual(engine.state.generatedAnswer);
  });

  it('dispatches a retry action', () => {
    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.retry();
    expect(executeSearch).toHaveBeenCalled();
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

  it('dispatches a like action', () => {
    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.like();
    expect(likeGeneratedAnswer).toHaveBeenCalled();
  });

  it('dispatches a dislike action', () => {
    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.dislike();
    expect(dislikeGeneratedAnswer).toHaveBeenCalled();
  });

  it('dispatches a open feedback modal action', () => {
    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.openFeedbackModal();
    expect(openGeneratedAnswerFeedbackModal).toHaveBeenCalled();
  });

  it('dispatches a close feedback modal action', () => {
    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.closeFeedbackModal();
    expect(closeGeneratedAnswerFeedbackModal).toHaveBeenCalled();
  });

  it('dispatches a sendFeedback action', () => {
    const generatedAnswer = createGeneratedAnswer();
    const feedback: GeneratedAnswerFeedback = {
      readable: 'unknown',
      correctTopic: 'unknown',
      documented: 'yes',
      hallucinationFree: 'no',
      helpful: false,
      details: 'some details',
    };
    generatedAnswer.sendFeedback(feedback);

    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerFeedback
    ).toHaveBeenCalledWith(feedback);
    expect(sendGeneratedAnswerFeedback).toHaveBeenCalledTimes(1);
  });

  it('dispatches a log citation click action', () => {
    const generatedAnswer = createGeneratedAnswer();
    const citationId = 'citationId';
    generatedAnswer.logCitationClick(citationId);
    expect(
      generatedAnswerAnalyticsClient.logOpenGeneratedAnswerSource
    ).toHaveBeenCalledWith(citationId);
  });

  it('dispatches a log citation hover action', () => {
    const generatedAnswer = createGeneratedAnswer();
    const citationId = 'citationId';
    const citationHoverTimeMs = 1000;
    generatedAnswer.logCitationHover(citationId, citationHoverTimeMs);
    expect(
      generatedAnswerAnalyticsClient.logHoverCitation
    ).toHaveBeenCalledWith(citationId, citationHoverTimeMs);
  });

  it('dispatches a show action if the component is not already visible', () => {
    engine = buildEngineWithGeneratedAnswer({isVisible: false});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {isVisible: false},
    });
    generatedAnswer.show();
    expect(setIsVisible).toHaveBeenCalledWith(true);
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerShowAnswers
    ).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch a show action if the component is already visible', () => {
    engine = buildEngineWithGeneratedAnswer({isVisible: true});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {isVisible: true},
    });
    generatedAnswer.show();
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerShowAnswers
    ).not.toHaveBeenCalled();
  });

  it('dispatches a hide action if the component is visible', () => {
    engine = buildEngineWithGeneratedAnswer({isVisible: true});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {isVisible: true},
    });
    generatedAnswer.hide();
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerHideAnswers
    ).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch a hide action if the component is not visible', () => {
    engine = buildEngineWithGeneratedAnswer({isVisible: false});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {isVisible: false},
    });
    generatedAnswer.hide();
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerHideAnswers
    ).not.toHaveBeenCalled();
  });

  it('dispatches an expand action if the component is not already expanded', () => {
    engine = buildEngineWithGeneratedAnswer({expanded: false});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {expanded: false},
    });
    generatedAnswer.expand();
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerExpand
    ).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch an expand action if the component is already expanded', () => {
    engine = buildEngineWithGeneratedAnswer({expanded: true});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {expanded: true},
    });
    generatedAnswer.expand();
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerExpand
    ).not.toHaveBeenCalled();
  });

  it('dispatches a collapse action if the component is expanded', () => {
    engine = buildEngineWithGeneratedAnswer({expanded: true});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {expanded: true},
    });
    generatedAnswer.collapse();
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerCollapse
    ).toHaveBeenCalledTimes(1);
  });

  it('does not dispatch a collapse action if the component is not expanded', () => {
    engine = buildEngineWithGeneratedAnswer({expanded: false});
    const generatedAnswer = createGeneratedAnswer({
      initialState: {expanded: false},
    });
    generatedAnswer.collapse();
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerCollapse
    ).not.toHaveBeenCalled();
  });

  it('dispatches a log copy to clipboard action', () => {
    const generatedAnswer = createGeneratedAnswer();
    generatedAnswer.logCopyToClipboard();
    expect(
      generatedAnswerAnalyticsClient.logCopyGeneratedAnswer
    ).toHaveBeenCalledTimes(1);
  });

  it('dispatches the setIsVisible with true when the initial state is set to true', () => {
    createGeneratedAnswer({initialState: {isVisible: true}});
    expect(setIsVisible).toHaveBeenCalledWith(true);
  });

  it('dispatches setIsVisible with false when the initial state is set to false', () => {
    createGeneratedAnswer({initialState: {isVisible: false}});
    expect(setIsVisible).toHaveBeenCalledWith(false);
  });

  it('should dispatch registerFieldsToIncludeInCitations to register the fields to include in citations', () => {
    const exampleFieldsToIncludeInCitations = ['foo', 'bar'];

    createGeneratedAnswer({
      fieldsToIncludeInCitations: exampleFieldsToIncludeInCitations,
    });
    expect(registerFieldsToIncludeInCitations).toHaveBeenCalledWith(
      exampleFieldsToIncludeInCitations
    );
  });

  describe('when used with a preloaded state', () => {
    beforeEach(() => {
      const state = createMockState({
        generatedAnswer: {
          ...getGeneratedAnswerInitialState(),
          id: 'some-id',
        },
      });
      state.search.requestId = 'some-request-id';
      state.search.extendedResults.generativeQuestionAnsweringId =
        'some-stream-id';
      engine = buildMockSearchEngine(state);
    });

    it('should not trigger any actions on initialization', () => {
      engine.dispatch.mockClear();
      createGeneratedAnswer();
      expect(engine.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('#enable', () => {
    let subscribeStateManagerMock: any;

    const setupEngine = (isEnabled: boolean) => {
      engine = buildEngineWithGeneratedAnswer({
        id: 'genQaEngineId',
        isEnabled,
      });
      createGeneratedAnswer({
        initialState: {isEnabled},
      });

      engine.state.search = {
        ...engine.state.search,
        extendedResults: {
          generativeQuestionAnsweringId: 'streamId',
        },
      };

      subscribeStateManagerMock.subscribeToSearchRequests(engine);
    };

    beforeEach(() => {
      vi.clearAllMocks();

      subscribeStateManagerMock = {
        engines: {
          genQaEngineId: {
            lastStreamId: '',
          },
        },
        subscribeToSearchRequests:
          subscribeStateManager.subscribeToSearchRequests,
      };

      subscribeStateManager.engines = subscribeStateManagerMock.engines;
    });

    it('should stream answer when generated answer is enabled', () => {
      setupEngine(true);

      expect(engine.subscribe).toHaveBeenCalled();

      const listener = engine.subscribe.mock.calls[0][0];
      listener();

      expect(streamAnswer).toHaveBeenCalled();
    });

    it('should not stream answer when generated answer is disabled', () => {
      setupEngine(false);

      expect(engine.subscribe).toHaveBeenCalled();

      const listener = engine.subscribe.mock.calls[0][0];
      listener();

      expect(streamAnswer).not.toHaveBeenCalled();
    });

    it('should reset answer when generated answer is enabled', () => {
      setupEngine(true);

      expect(engine.subscribe).toHaveBeenCalled();

      const listener = engine.subscribe.mock.calls[0][0];
      listener();

      expect(resetAnswer).toHaveBeenCalled();
    });

    it('should not reset answer when generated answer is disabled', () => {
      setupEngine(false);

      expect(engine.subscribe).toHaveBeenCalled();

      const listener = engine.subscribe.mock.calls[0][0];
      listener();

      expect(resetAnswer).not.toHaveBeenCalled();
    });
  });
});
