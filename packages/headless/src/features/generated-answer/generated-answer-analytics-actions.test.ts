import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import type {GeneratedAnswerCitation} from '../../controllers/generated-answer/headless-generated-answer.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {createMockState} from '../../test/mock-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {
  type GeneratedAnswerFeedback,
  logCopyGeneratedAnswer,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerCollapse,
  logGeneratedAnswerExpand,
  logGeneratedAnswerFeedback,
  logGeneratedAnswerHideAnswers,
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerStreamEnd,
  logHoverCitation,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logRetryGeneratedAnswer,
} from './generated-answer-analytics-actions.js';
import {getGeneratedAnswerInitialState} from './generated-answer-state.js';

const mockLogFunction = vi.fn();
const mockMakeGeneratedAnswerFeedbackSubmit = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeRetryGeneratedAnswer = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerCitationClick = vi.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerSourceHover = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeLikeGeneratedAnswer = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeDislikeGeneratedAnswer = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerStreamEnd = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerShowAnswers = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerHideAnswers = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerCopyToClipboard = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerExpand = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerCollapse = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeGeneratedAnswerFeedbackSubmitV2 = vi.fn(() => ({
  log: mockLogFunction,
}));
const emit = vi.fn();

vi.mock('@coveo/relay');

vi.mocked(createRelay).mockReturnValue({
  emit,
  getMeta: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  updateConfig: vi.fn(),
  version: 'foo',
});

vi.mock('coveo.analytics');
const mockCoveoSearchPageClient = vi.mocked(CoveoSearchPageClient);

const exampleFeedback: GeneratedAnswerFeedback = {
  helpful: true,
  documented: 'yes',
  correctTopic: 'no',
  hallucinationFree: 'unknown',
  readable: 'yes',
};
const exampleGenerativeQuestionAnsweringId =
  '94b77748-2479-4e4b-a4e8-010fa62b04a0';
const exampleSearchUid = '456';

const exampleCitation: GeneratedAnswerCitation = {
  id: 'some-citation-id',
  permanentid: 'citation-permanent-id',
  title: 'Sample citation',
  uri: 'http://localhost/citations/some-citation-id',
  source: 'source-name',
  clickUri: 'http://localhost/citations/some-citation-id',
};

const expectedCitationDocumentInfo = {
  queryPipeline: '',
  documentUri: exampleCitation.uri,
  sourceName: exampleCitation.source,
  documentPosition: 1,
  documentTitle: exampleCitation.title,
  documentUrl: exampleCitation.clickUri,
};

const exampleDocumentId = {
  contentIdKey: 'permanentid',
  contentIdValue: exampleCitation.permanentid,
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
    vi.clearAllMocks();
  });

  describe('when analyticsMode is `legacy`', () => {
    beforeEach(() => {
      mockCoveoSearchPageClient.mockImplementation(function () {
        this.disable = vi.fn();
        this.makeGeneratedAnswerFeedbackSubmit =
          mockMakeGeneratedAnswerFeedbackSubmit as unknown as typeof this.makeGeneratedAnswerFeedbackSubmit;
        this.makeRetryGeneratedAnswer =
          mockMakeRetryGeneratedAnswer as unknown as typeof this.makeRetryGeneratedAnswer;
        this.makeGeneratedAnswerCitationClick =
          mockMakeGeneratedAnswerCitationClick as unknown as typeof this.makeGeneratedAnswerCitationClick;
        this.makeGeneratedAnswerSourceHover =
          mockMakeGeneratedAnswerSourceHover as unknown as typeof this.makeGeneratedAnswerSourceHover;
        this.makeLikeGeneratedAnswer =
          mockMakeLikeGeneratedAnswer as unknown as typeof this.makeLikeGeneratedAnswer;
        this.makeDislikeGeneratedAnswer =
          mockMakeDislikeGeneratedAnswer as unknown as typeof this.makeDislikeGeneratedAnswer;
        this.makeGeneratedAnswerStreamEnd =
          mockMakeGeneratedAnswerStreamEnd as unknown as typeof this.makeGeneratedAnswerStreamEnd;
        this.makeGeneratedAnswerShowAnswers =
          mockMakeGeneratedAnswerShowAnswers as unknown as typeof this.makeGeneratedAnswerShowAnswers;
        this.makeGeneratedAnswerHideAnswers =
          mockMakeGeneratedAnswerHideAnswers as unknown as typeof this.makeGeneratedAnswerHideAnswers;
        this.makeGeneratedAnswerCopyToClipboard =
          mockMakeGeneratedAnswerCopyToClipboard as unknown as typeof this.makeGeneratedAnswerCopyToClipboard;
        this.makeGeneratedAnswerExpand =
          mockMakeGeneratedAnswerExpand as unknown as typeof this.makeGeneratedAnswerExpand;
        this.makeGeneratedAnswerCollapse =
          mockMakeGeneratedAnswerCollapse as unknown as typeof this.makeGeneratedAnswerCollapse;
        this.makeGeneratedAnswerFeedbackSubmitV2 =
          mockMakeGeneratedAnswerFeedbackSubmitV2 as unknown as typeof this.makeGeneratedAnswerFeedbackSubmitV2;
      });
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

    it('should log #logOpenGeneratedAnswerSource with the right payload', async () => {
      await logOpenGeneratedAnswerSource(exampleCitation.id)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeGeneratedAnswerCitationClick;

      expect(mockToUse).toHaveBeenCalledTimes(1);

      expect(mockToUse.mock.calls[0][0]).toStrictEqual(
        expectedCitationDocumentInfo
      );

      expect(mockToUse.mock.calls[0][1]).toStrictEqual({
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        citationId: exampleCitation.id,
        documentId: exampleDocumentId,
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

    [false, true].map((answerGenerated) => {
      it(`should log #logGeneratedAnswerStreamEnd with ${answerGenerated ? 'generated' : 'not generated'} and 'empty' answer`, async () => {
        await logGeneratedAnswerStreamEnd(answerGenerated)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        expect(emit).toHaveBeenCalledTimes(1);
        expect(emit.mock.calls[0]).toMatchSnapshot();
      });
    });

    it('should log #logGeneratedAnswerResponseLinked with the response id and answer id', async () => {
      await logGeneratedAnswerResponseLinked()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
