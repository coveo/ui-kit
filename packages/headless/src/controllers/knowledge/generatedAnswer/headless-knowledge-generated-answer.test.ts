import {
  closeGeneratedAnswerFeedbackModal,
  dislikeGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  registerFieldsToIncludeInCitations,
  sendGeneratedAnswerFeedback,
  setIsVisible,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions';
import {
  generatedAnswerAnalyticsClient,
  GeneratedAnswerFeedback,
} from '../../../features/generated-answer/generated-answer-analytics-actions';
import {
  GeneratedAnswerState,
  getGeneratedAnswerInitialState,
} from '../../../features/generated-answer/generated-answer-state';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../generated-answer/headless-generated-answer';
import {
  buildKnowledgeGeneratedAnswer,
  KnowledgeEngine,
} from './headless-knowledge-generated-answer';

jest.mock('../../../features/generated-answer/generated-answer-actions');
jest.mock(
  '../../../features/generated-answer/generated-answer-analytics-actions'
);
jest.mock('../../../features/search/search-actions');

describe('knowledge-generated-answer', () => {
  it('should be tested', () => {
    expect(true).toBe(true);
  });

  let engine: MockedSearchEngine;

  const createGeneratedAnswer = (props: GeneratedAnswerProps = {}) =>
    buildKnowledgeGeneratedAnswer(
      engine as unknown as KnowledgeEngine,
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
    jest.clearAllMocks();
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

  it('dispatches a send feedback action', () => {
    const generatedAnswer = createGeneratedAnswer();
    const feedback: GeneratedAnswerFeedback = 'harmful';
    generatedAnswer.sendFeedback(feedback);
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerFeedback
    ).toHaveBeenCalledWith(feedback);
    expect(sendGeneratedAnswerFeedback).toHaveBeenCalledTimes(1);
  });

  it('dispatches a send detailed feedback action', () => {
    const generatedAnswer = createGeneratedAnswer();
    const details = 'details';
    generatedAnswer.sendDetailedFeedback(details);
    expect(
      generatedAnswerAnalyticsClient.logGeneratedAnswerDetailedFeedback
    ).toHaveBeenCalledWith(details);
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

  it('dispatches the updateResponseFormat with the initial response format', () => {
    const responseFormat: GeneratedResponseFormat = {answerStyle: 'concise'};
    createGeneratedAnswer({initialState: {responseFormat}});
    expect(updateResponseFormat).toHaveBeenCalledWith(responseFormat);
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
});
