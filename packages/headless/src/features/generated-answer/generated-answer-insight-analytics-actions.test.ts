import {createRelay} from '@coveo/relay';
import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import type {GeneratedAnswerFeedback} from './generated-answer-analytics-actions.js';
import {
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
} from './generated-answer-insight-analytics-actions.js';
import {getGeneratedAnswerInitialState} from './generated-answer-state.js';

const mockLogGeneratedAnswerFeedbackSubmit = vi.fn();
const mockLogRetryGeneratedAnswer = vi.fn();
const mockLogGeneratedAnswerCitationClick = vi.fn();
const mockLogHoverCitation = vi.fn();
const mockLogLikeGeneratedAnswer = vi.fn();
const mockLogDislikeGeneratedAnswer = vi.fn();
const mockLogGeneratedAnswerStreamEnd = vi.fn();
const mockLogGeneratedAnswerShowAnswers = vi.fn();
const mockLogGeneratedAnswerHideAnswers = vi.fn();
const mockLogCopyGeneratedAnswer = vi.fn();
const mockLogGeneratedAnswerExpand = vi.fn();
const mockLogGeneratedAnswerCollapse = vi.fn();
const mockLogGeneratedAnswerFeedbackSubmitV2 = vi.fn();
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
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logGeneratedAnswerFeedbackSubmit = mockLogGeneratedAnswerFeedbackSubmit;
  this.logRetryGeneratedAnswer = mockLogRetryGeneratedAnswer;
  this.logGeneratedAnswerCitationClick = mockLogGeneratedAnswerCitationClick;
  this.logGeneratedAnswerSourceHover = mockLogHoverCitation;
  this.logLikeGeneratedAnswer = mockLogLikeGeneratedAnswer;
  this.logDislikeGeneratedAnswer = mockLogDislikeGeneratedAnswer;
  this.logGeneratedAnswerStreamEnd = mockLogGeneratedAnswerStreamEnd;
  this.logGeneratedAnswerShowAnswers = mockLogGeneratedAnswerShowAnswers;
  this.logGeneratedAnswerHideAnswers = mockLogGeneratedAnswerHideAnswers;
  this.logGeneratedAnswerCopyToClipboard = mockLogCopyGeneratedAnswer;
  this.logGeneratedAnswerExpand = mockLogGeneratedAnswerExpand;
  this.logGeneratedAnswerCollapse = mockLogGeneratedAnswerCollapse;
  this.logGeneratedAnswerFeedbackSubmitV2 =
    mockLogGeneratedAnswerFeedbackSubmitV2;
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
const exampleCitationId = 'citation_id';
const exampleCitationPermanentid = 'citation_permanentid';
const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleCitationTitle = 'example title';
const exampleCitationUri = 'example: uri';
const exampleCitationSource = 'example source name';
const exampleCitationClickUri = 'example: click uri';

const expectedCaseContext = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
};

const expectedCitationDocumentInfo = {
  queryPipeline: '',
  documentUri: exampleCitationUri,
  sourceName: exampleCitationSource,
  documentPosition: 1,
  documentTitle: exampleCitationTitle,
  documentUrl: exampleCitationClickUri,
};

const exampleDocumentId = {
  contentIdKey: 'permanentid',
  contentIdValue: exampleCitationPermanentid,
};

describe('generated answer insight analytics actions', () => {
  let engine: MockedInsightEngine;
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
    citations: [
      {
        id: exampleCitationId,
        permanentid: exampleCitationPermanentid,
        title: exampleCitationTitle,
        uri: exampleCitationUri,
        source: exampleCitationSource,
        clickUri: exampleCitationClickUri,
      },
    ],
  };
  const insightCaseContextState = {
    caseContext: {
      Case_Subject: exampleSubject,
      Case_Description: exampleDescription,
    },
    caseId: exampleCaseId,
    caseNumber: exampleCaseNumber,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when analyticsMode is `legacy`', () => {
    beforeEach(() => {
      engine = buildMockInsightEngine(
        buildMockInsightState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'legacy',
            },
          },
          search: searchState,
          generatedAnswer: generatedAnswerState,
          insightCaseContext: insightCaseContextState,
        })
      );
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

    it('should log #logOpenGeneratedAnswerSource with the right payload', async () => {
      await logOpenGeneratedAnswerSource(exampleCitationId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogGeneratedAnswerCitationClick;
      const expectedMetadata = {
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        citationId: exampleCitationId,
        documentId: exampleDocumentId,
      };

      expect(mockToUse).toHaveBeenCalledTimes(1);

      expect(mockToUse.mock.calls[0][0]).toStrictEqual(
        expectedCitationDocumentInfo
      );

      expect(mockToUse.mock.calls[0][1]).toStrictEqual(expectedMetadata);

      expect(mockToUse.mock.calls[0][2]).toStrictEqual(expectedCaseContext);
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

    it('should log #logGeneratedAnswerFeedback with V2 payload', async () => {
      await logGeneratedAnswerFeedback(exampleFeedback)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogGeneratedAnswerFeedbackSubmitV2;
      const expectedMetadata = {
        generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        ...exampleFeedback,
      };

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith(
        expectedMetadata,
        expectedCaseContext
      );
    });

    [false, true].map((answerGenerated) => {
      it('should log #logGeneratedAnswerStreamEnd with the right payload', async () => {
        await logGeneratedAnswerStreamEnd(answerGenerated)()(
          engine.dispatch,
          () => engine.state,
          {} as ThunkExtraArguments
        );

        const mockToUse = mockLogGeneratedAnswerStreamEnd;
        const expectedMetadata = {
          generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
          answerGenerated,
          answerTextIsEmpty: answerGenerated || undefined,
        };

        expect(mockToUse).toHaveBeenCalledTimes(1);
        expect(mockToUse).toHaveBeenCalledWith(
          expectedMetadata,
          expectedCaseContext
        );
      });
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

    it('should log #logGeneratedAnswerExpand with the right payload', async () => {
      await logGeneratedAnswerExpand()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogGeneratedAnswerExpand;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith(
        {
          generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        },
        expectedCaseContext
      );
    });

    it('should log #logGeneratedAnswerCollapse with the right payload', async () => {
      await logGeneratedAnswerCollapse()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogGeneratedAnswerCollapse;

      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse).toHaveBeenCalledWith(
        {
          generativeQuestionAnsweringId: exampleGenerativeQuestionAnsweringId,
        },
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

  describe('when analyticsMode is `next`', () => {
    beforeEach(() => {
      engine = buildMockInsightEngine(
        buildMockInsightState({
          configuration: {
            ...getConfigurationInitialState(),
            analytics: {
              ...getConfigurationInitialState().analytics,
              analyticsMode: 'next',
            },
          },
          search: searchState,
          generatedAnswer: generatedAnswerState,
          insightCaseContext: insightCaseContextState,
        })
      );
    });

    it('should log #logOpenGeneratedAnswerSource with the right payload', async () => {
      await logOpenGeneratedAnswerSource(exampleCitationId)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logHoverCitation with the right payload', async () => {
      const exampleHoverTime = 100;
      await logHoverCitation(exampleCitationId, exampleHoverTime)()(
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
