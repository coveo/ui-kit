import {createRelay} from '@coveo/relay';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {createMockState} from '../../test/mock-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {
  logCopyGeneratedAnswer,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerFeedback,
  logGeneratedAnswerHideAnswers,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerStreamEnd,
  logHoverCitation,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logRephraseGeneratedAnswer,
  logRetryGeneratedAnswer,
  logGeneratedAnswerExpand,
  logGeneratedAnswerCollapse,
  GeneratedAnswerFeedback,
} from './generated-answer-analytics-actions';
import {getGeneratedAnswerInitialState} from './generated-answer-state';
import {generatedAnswerStyle} from './generated-response-format';

const mockLogFunction = jest.fn();
const mockMakeGeneratedAnswerFeedbackSubmit = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeRetryGeneratedAnswer = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeRephraseGeneratedAnswer = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeOpenGeneratedAnswerSource = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerSourceHover = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeLikeGeneratedAnswer = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeDislikeGeneratedAnswer = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerStreamEnd = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerShowAnswers = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerHideAnswers = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerCopyToClipboard = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerExpand = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerCollapse = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerFeedbackSubmitV2 = jest.fn(() => ({
  log: mockLogFunction,
}));
const emit = jest.fn();

jest.mock('@coveo/relay');

jest.mocked(createRelay).mockReturnValue({
  emit,
  getMeta: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  updateConfig: jest.fn(),
  version: 'foo',
});

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
    makeGeneratedAnswerExpand: mockMakeGeneratedAnswerExpand,
    makeGeneratedAnswerCollapse: mockMakeGeneratedAnswerCollapse,
    makeGeneratedAnswerFeedbackSubmitV2:
      mockMakeGeneratedAnswerFeedbackSubmitV2,
  }));

  return {
    CoveoSearchPageClient: mockCoveoSearchPageClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleFeedback: GeneratedAnswerFeedback = {
  helpful: true,
  documented: 'yes',
  correctTopic: 'no',
  hallucinationFree: 'unknown',
  readable: 'yes',
};
const exampleGenerativeQuestionAnsweringId = '123';
const exampleSearchUid = '456';

const exampleCitation: GeneratedAnswerCitation = {
  id: 'some-citation-id',
  permanentid: 'citation-permanent-id',
  title: 'Sample citation',
  uri: 'http://localhost/citations/some-citation-id',
};

describe('generated answer analytics actions', () => {
  let engine: MockedSearchEngine;
  const searchState = buildMockSearchState({
    response: buildMockSearchResponse({
      searchUid: exampleSearchUid,
      extendedResults: {
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      },
    }),
  });
  const generatedAnswerState = {
    ...getGeneratedAnswerInitialState(),
    citations: [exampleCitation],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when analyticsMode is `legacy`', () => {
    beforeEach(() => {
      engine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'legacy',
            },
          },
          search: searchState,
          generatedAnswer: generatedAnswerState,
        })
      );
    });

    it('should log #logRetryGeneratedAnswer', async () => {
      await logRetryGeneratedAnswer()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeRetryGeneratedAnswer;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    generatedAnswerStyle.map((answerStyle) => {
      it(`should log #logRephraseGeneratedAnswer with "${answerStyle}" answer style`, async () => {
        const expectedFormat = {answerStyle};

        await logRephraseGeneratedAnswer(expectedFormat)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        const mockToUse = mockMakeRephraseGeneratedAnswer;

        expect(mockToUse).toHaveBeenCalledTimes(1);
        expect(mockToUse).toHaveBeenCalledWith({
          generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
          rephraseFormat: answerStyle,
        });
        expect(mockLogFunction).toHaveBeenCalledTimes(1);
      });
    });

    it('should log #logOpenGeneratedAnswerSource with the right payload', async () => {
      await logOpenGeneratedAnswerSource(exampleCitation.id)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeOpenGeneratedAnswerSource;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        citationId: exampleCitation.id,
        permanentId: exampleCitation.permanentid,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logHoverCitation with the right payload', async () => {
      const hoverDuration = 1234;

      await logHoverCitation(exampleCitation.id, hoverDuration)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerSourceHover;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        citationId: exampleCitation.id,
        permanentId: exampleCitation.permanentid,
        citationHoverTimeMs: hoverDuration,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logLikeGeneratedAnswer with the right payload', async () => {
      await logLikeGeneratedAnswer()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeLikeGeneratedAnswer;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logDislikeGeneratedAnswer with the right payload', async () => {
      await logDislikeGeneratedAnswer()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeDislikeGeneratedAnswer;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logGeneratedAnswerFeedback with V2 payload', async () => {
      await logGeneratedAnswerFeedback(exampleFeedback)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerFeedbackSubmitV2;
      const expectedMetadata = {
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        ...exampleFeedback,
      };

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith(expectedMetadata);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    [false, true].map((answerGenerated) => {
      it(`should log #logGeneratedAnswerStreamEnd with ${answerGenerated ? 'generated' : 'not generated'} and 'empty' answer`, async () => {
        await logGeneratedAnswerStreamEnd(answerGenerated)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        const mockToUse = mockMakeGeneratedAnswerStreamEnd;

        expect(mockToUse).toHaveBeenCalledTimes(1);
        expect(mockToUse).toHaveBeenCalledWith({
          generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
          answerGenerated,
          answerTextIsEmpty: answerGenerated || undefined,
        });
        expect(mockLogFunction).toHaveBeenCalledTimes(1);
      });
    });

    it("should log #logGeneratedAnswerStreamEnd with 'non empty' answer", async () => {
      const newEngine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'legacy',
            },
          },
          search: searchState,
          generatedAnswer: {
            ...generatedAnswerState,
            answer: 'generated answer',
          },
        })
      );
      await logGeneratedAnswerStreamEnd(true)()(
        newEngine.dispatch,
        () => newEngine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerStreamEnd;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        answerGenerated: true,
        answerTextIsEmpty: false,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logGeneratedAnswerShowAnswers with the right payload', async () => {
      await logGeneratedAnswerShowAnswers()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerShowAnswers;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logGeneratedAnswerHideAnswers with the right payload', async () => {
      await logGeneratedAnswerHideAnswers()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerHideAnswers;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logGeneratedAnswerExpand with the right payload', async () => {
      await logGeneratedAnswerExpand()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerExpand;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logGeneratedAnswerCollapse with the right payload', async () => {
      await logGeneratedAnswerCollapse()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerCollapse;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logCopyGeneratedAnswer with the right payload', async () => {
      await logCopyGeneratedAnswer()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerCopyToClipboard;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('when analyticsMode is `next`', () => {
    beforeEach(() => {
      engine = buildMockSearchEngine(
        createMockState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'next',
            },
          },
          search: searchState,
          generatedAnswer: generatedAnswerState,
        })
      );
    });

    it('should log #logOpenGeneratedAnswerSource with the right payload', async () => {
      await logOpenGeneratedAnswerSource(exampleCitation.id)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logHoverCitation with the right payload', async () => {
      const hoverDuration = 1234;

      await logHoverCitation(exampleCitation.id, hoverDuration)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logLikeGeneratedAnswer with the right payload', async () => {
      await logLikeGeneratedAnswer()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logDislikeGeneratedAnswer with the right payload', async () => {
      await logDislikeGeneratedAnswer()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logGeneratedAnswerFeedback with the right payload', async () => {
      await logGeneratedAnswerFeedback(exampleFeedback)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logGeneratedAnswerShowAnswers with the right payload', async () => {
      await logGeneratedAnswerShowAnswers()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logGeneratedAnswerHideAnswers with the right payload', async () => {
      await logGeneratedAnswerHideAnswers()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logGeneratedAnswerExpand with the right payload', async () => {
      await logGeneratedAnswerExpand()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logGeneratedAnswerCollapse with the right payload', async () => {
      await logGeneratedAnswerCollapse()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logCopyGeneratedAnswer with the right payload', async () => {
      await logCopyGeneratedAnswer()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
