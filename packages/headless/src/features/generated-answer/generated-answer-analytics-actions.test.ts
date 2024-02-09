import {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {createMockState} from '../../test/mock-state';
import {
  logCopyGeneratedAnswer,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logGeneratedAnswerHideAnswers,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerStreamEnd,
  logHoverCitation,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logRephraseGeneratedAnswer,
  logRetryGeneratedAnswer,
} from './generated-answer-analytics-actions';
import {generatedAnswerStyle} from './generated-response-format';

const mockMakeGeneratedAnswerFeedbackSubmit = jest.fn();
const mockMakeRetryGeneratedAnswer = jest.fn();
const mockMakeRephraseGeneratedAnswer = jest.fn();
const mockMakeOpenGeneratedAnswerSource = jest.fn();
const mockMakeGeneratedAnswerSourceHover = jest.fn();
const mockMakeLikeGeneratedAnswer = jest.fn();
const mockMakeDislikeGeneratedAnswer = jest.fn();
const mockMakeGeneratedAnswerStreamEnd = jest.fn();
const mockMakeGeneratedAnswerShowAnswers = jest.fn();
const mockMakeGeneratedAnswerHideAnswers = jest.fn();
const mockMakeGeneratedAnswerCopyToClipboard = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoSearchPageClient = jest.fn(() => ({
    disable: jest.fn(),
    makeGeneratedAnswerFeedbackSubmit: mockMakeGeneratedAnswerFeedbackSubmit,
    makeRetryGeneratedAnswer: mockMakeRetryGeneratedAnswer,
    makeRephraseGeneratedAnswer: mockMakeRephraseGeneratedAnswer,
    makeOpenGeneratedAnswerSource: mockMakeOpenGeneratedAnswerSource,
    makeGeneratedAnswerSourceHover: mockMakeGeneratedAnswerSourceHover,
    makeLikeGeneratedAnswer: mockMakeLikeGeneratedAnswer,
    makeDislikeGeneratedAnswer: mockMakeDislikeGeneratedAnswer,
    makeGeneratedAnswerStreamEnd: mockMakeGeneratedAnswerStreamEnd,
    makeGeneratedAnswerShowAnswers: mockMakeGeneratedAnswerShowAnswers,
    makeGeneratedAnswerHideAnswers: mockMakeGeneratedAnswerHideAnswers,
    makeGeneratedAnswerCopyToClipboard: mockMakeGeneratedAnswerCopyToClipboard,
  }));

  return {
    CoveoSearchPageClient: mockCoveoSearchPageClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleFeedback = 'irrelevant';
const exampleGenerativeQuestionAnsweringId = '123';
const exampleDetails = 'example details';

const exampleCitation: GeneratedAnswerCitation = {
  id: 'some-citation-id',
  permanentid: 'citation-permanent-id',
  title: 'Sample citation',
  uri: 'http://localhost/citations/some-citation-id',
};

describe('the analytics related to the generated answer feature', () => {
  let engine: MockSearchEngine;

  beforeEach(() => {
    engine = buildMockSearchAppEngine({
      state: createMockState({
        search: buildMockSearchState({
          response: buildMockSearchResponse({
            extendedResults: {
              generativeQuestionAnsweringId:
                exampleGenerativeQuestionAnsweringId,
            },
          }),
        }),
        generatedAnswer: {
          id: exampleGenerativeQuestionAnsweringId,
          citations: [exampleCitation],
          isVisible: true,
          isLoading: false,
          isStreaming: false,
          liked: false,
          disliked: false,
          responseFormat: {answerStyle: 'default'},
          feedbackModalOpen: false,
          feedbackSubmitted: false,
          fieldsToIncludeInCitations: [],
        },
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log #logRetryGeneratedAnswer', async () => {
    await engine.dispatch(logRetryGeneratedAnswer());

    const mockToUse = mockMakeRetryGeneratedAnswer;

    expect(mockToUse).toHaveBeenCalledTimes(1);
  });

  generatedAnswerStyle.map((answerStyle) => {
    it(`should log #logRephraseGeneratedAnswer with "${answerStyle}" answer style`, async () => {
      const expectedFormat = {answerStyle};

      await engine.dispatch(logRephraseGeneratedAnswer(expectedFormat));

      const mockToUse = mockMakeRephraseGeneratedAnswer;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        rephraseFormat: answerStyle,
      });
    });
  });

  it('should log #logOpenGeneratedAnswerSource with the right payload', async () => {
    await engine.dispatch(logOpenGeneratedAnswerSource(exampleCitation.id));

    const mockToUse = mockMakeOpenGeneratedAnswerSource;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith({
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      citationId: exampleCitation.id,
      permanentId: exampleCitation.permanentid,
    });
  });

  it('should log #logHoverCitation with the right payload', async () => {
    const hoverDuration = 1234;

    await engine.dispatch(logHoverCitation(exampleCitation.id, hoverDuration));

    const mockToUse = mockMakeGeneratedAnswerSourceHover;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith({
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      citationId: exampleCitation.id,
      permanentId: exampleCitation.permanentid,
      citationHoverTimeMs: hoverDuration,
    });
  });

  it('should log #logLikeGeneratedAnswer with the right payload', async () => {
    await engine.dispatch(logLikeGeneratedAnswer());

    const mockToUse = mockMakeLikeGeneratedAnswer;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith({
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    });
  });

  it('should log #logDislikeGeneratedAnswer with the right payload', async () => {
    await engine.dispatch(logDislikeGeneratedAnswer());

    const mockToUse = mockMakeDislikeGeneratedAnswer;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith({
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    });
  });

  it('should log #logGeneratedAnswerFeedback with the right payload', async () => {
    await engine.dispatch(logGeneratedAnswerFeedback(exampleFeedback));

    const mockToUse = mockMakeGeneratedAnswerFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: exampleFeedback,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(expectedMetadata);
  });

  it('should log #logGeneratedAnswerDetailedFeedback with the right payload', async () => {
    await engine.dispatch(logGeneratedAnswerDetailedFeedback(exampleDetails));

    const mockToUse = mockMakeGeneratedAnswerFeedbackSubmit;
    const expectedMetadata = {
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      reason: 'other',
      details: exampleDetails,
    };

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith(expectedMetadata);
  });

  [false, true].map((answerGenerated) => {
    it(`should log #logGeneratedAnswerStreamEnd with ${answerGenerated ? 'generated' : 'not generated'} answer`, async () => {
      await engine.dispatch(logGeneratedAnswerStreamEnd(answerGenerated));

      const mockToUse = mockMakeGeneratedAnswerStreamEnd;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        answerGenerated,
      });
    });
  });

  it('should log #logGeneratedAnswerShowAnswers with the right payload', async () => {
    await engine.dispatch(logGeneratedAnswerShowAnswers());

    const mockToUse = mockMakeGeneratedAnswerShowAnswers;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith({
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    });
  });

  it('should log #logGeneratedAnswerHideAnswers with the right payload', async () => {
    await engine.dispatch(logGeneratedAnswerHideAnswers());

    const mockToUse = mockMakeGeneratedAnswerHideAnswers;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith({
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    });
  });

  it('should log #logCopyGeneratedAnswer with the right payload', async () => {
    await engine.dispatch(logCopyGeneratedAnswer());

    const mockToUse = mockMakeGeneratedAnswerCopyToClipboard;

    expect(mockToUse).toHaveBeenCalledTimes(1);
    expect(mockToUse).toHaveBeenCalledWith({
      generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
    });
  });
});
