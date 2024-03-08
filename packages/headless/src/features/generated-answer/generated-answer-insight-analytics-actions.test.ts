import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {InsightAppState} from '../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logRetryGeneratedAnswer,
  logRephraseGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logHoverCitation,
  logLikeGeneratedAnswer,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerStreamEnd,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerHideAnswers,
  logCopyGeneratedAnswer,
} from './generated-answer-insight-analytics-actions';

const mockLogGeneratedAnswerFeedbackSubmit = jest.fn();
const mockLogRetryGeneratedAnswer = jest.fn();
const mockLogRephraseGeneratedAnswer = jest.fn();
const mockLogOpenGeneratedAnswerSource = jest.fn();
const mockLogHoverCitation = jest.fn();
const mockLogLikeGeneratedAnswer = jest.fn();
const mockLogDislikeGeneratedAnswer = jest.fn();
const mockLogGeneratedAnswerStreamEnd = jest.fn();
const mockLogGeneratedAnswerShowAnswers = jest.fn();
const mockLogGeneratedAnswerHideAnswers = jest.fn();
const mockLogCopyGeneratedAnswer = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: jest.fn(),
    logGeneratedAnswerFeedbackSubmit: mockLogGeneratedAnswerFeedbackSubmit,
    logRetryGeneratedAnswer: mockLogRetryGeneratedAnswer,
    logRephraseGeneratedAnswer: mockLogRephraseGeneratedAnswer,
    logOpenGeneratedAnswerSource: mockLogOpenGeneratedAnswerSource,
    logGeneratedAnswerSourceHover: mockLogHoverCitation,
    logLikeGeneratedAnswer: mockLogLikeGeneratedAnswer,
    logDislikeGeneratedAnswer: mockLogDislikeGeneratedAnswer,
    logGeneratedAnswerStreamEnd: mockLogGeneratedAnswerStreamEnd,
    logGeneratedAnswerShowAnswers: mockLogGeneratedAnswerShowAnswers,
    logGeneratedAnswerHideAnswers: mockLogGeneratedAnswerHideAnswers,
    logGeneratedAnswerCopyToClipboard: mockLogCopyGeneratedAnswer,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleFeedback = 'irrelevant';
const exampleGenerativeQuestionAnsweringId = '123';
const exampleDetails = 'example details';
const exampleCitationId = 'citation_id';
const exampleCitationPermanentid = 'citation_permanentid';
const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';

const expectedCaseContext = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
};

describe('the analytics related to the generated answer feature in the insight use case', () => {
  let engine: MockedInsightEngine;
  let state: InsightAppState;

  beforeEach(() => {
    state = buildMockInsightState();
    state.search.response.extendedResults.generativeQuestionAnsweringId =
      exampleGenerativeQuestionAnsweringId;
    state.generatedAnswer.citations = [
      {
        id: exampleCitationId,
        permanentid: exampleCitationPermanentid,
        title: 'example title',
        uri: 'example: uri',
      },
    ];
    state.insightCaseContext = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };
    engine = buildMockInsightEngine(state);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log #logRetryGeneratedAnswer with the right payload', async () => {
    await logRetryGeneratedAnswer()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogRetryGeneratedAnswer;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(expectedCaseContext);
  });

  it('should log #logRephraseGeneratedAnswer with the right payload', async () => {
    const exampleRephraseFormat = 'step';
    await logRephraseGeneratedAnswer({answerStyle: exampleRephraseFormat})()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogRephraseGeneratedAnswer;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      rephraseFormat: exampleRephraseFormat,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logOpenGeneratedAnswerSource with the right payload', async () => {
    await logOpenGeneratedAnswerSource(exampleCitationId)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogOpenGeneratedAnswerSource;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      permanentId: exampleCitationPermanentid,
      citationId: exampleCitationId,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logHoverCitation with the right payload', async () => {
    const exampleHoverTime = 100;
    await logHoverCitation(exampleCitationId, exampleHoverTime)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogHoverCitation;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      permanentId: exampleCitationPermanentid,
      citationId: exampleCitationId,
      citationHoverTimeMs: exampleHoverTime,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logLikeGeneratedAnswer with the right payload', async () => {
    await logLikeGeneratedAnswer()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogLikeGeneratedAnswer;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logDislikeGeneratedAnswer with the right payload', async () => {
    await logDislikeGeneratedAnswer()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogDislikeGeneratedAnswer;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logGeneratedAnswerFeedback with the right payload', async () => {
    await logGeneratedAnswerFeedback(exampleFeedback)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogGeneratedAnswerFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: exampleFeedback,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logGeneratedAnswerDetailedFeedback with the right payload', async () => {
    await logGeneratedAnswerDetailedFeedback(exampleDetails)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogGeneratedAnswerFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: 'other',
      details: exampleDetails,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logGeneratedAnswerStreamEnd with the right payload', async () => {
    await logGeneratedAnswerStreamEnd(true)()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogGeneratedAnswerStreamEnd;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      answerGenerated: true,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logGeneratedAnswerShowAnswers with the right payload', async () => {
    await logGeneratedAnswerShowAnswers()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogGeneratedAnswerShowAnswers;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logGeneratedAnswerHideAnswers with the right payload', async () => {
    await logGeneratedAnswerHideAnswers()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogGeneratedAnswerHideAnswers;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });

  it('should log #logCopyGeneratedAnswer with the right payload', async () => {
    await logCopyGeneratedAnswer()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const mockToUse = mockLogCopyGeneratedAnswer;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(
      expectedMetadata,
      expectedCaseContext
    );
  });
});
