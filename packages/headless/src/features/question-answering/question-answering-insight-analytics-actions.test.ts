import {createRelay} from '@coveo/relay';
import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {buildMockRaw} from '../../test/mock-raw.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {emptyQuestionAnswer} from '../search/search-state.js';
import {
  logCloseSmartSnippetFeedbackModal,
  logCollapseSmartSnippet,
  logCollapseSmartSnippetSuggestion,
  logDislikeSmartSnippet,
  logExpandSmartSnippet,
  logExpandSmartSnippetSuggestion,
  logLikeSmartSnippet,
  logOpenSmartSnippetFeedbackModal,
  logOpenSmartSnippetInlineLink,
  logOpenSmartSnippetSource,
  logOpenSmartSnippetSuggestionInlineLink,
  logOpenSmartSnippetSuggestionSource,
  logSmartSnippetDetailedFeedback,
  logSmartSnippetFeedback,
} from './question-answering-insight-analytics-actions.js';
import {getQuestionAnsweringInitialState} from './question-answering-state.js';

const mockLogExpandSmartSnippet = vi.fn();
const mockLogCollapseSmartSnippet = vi.fn();
const mockLogLikeSmartSnippet = vi.fn();
const mockLogDislikeSmartSnippet = vi.fn();
const mockLogOpenSmartSnippetSource = vi.fn();
const mockLogOpenSmartSnippetInlineLink = vi.fn();
const mockLogOpenSmartSnippetFeedbackModal = vi.fn();
const mockLogCloseSmartSnippetFeedbackModal = vi.fn();
const mockLogSmartSnippetFeedback = vi.fn();
const mockLogExpandSmartSnippetSuggestion = vi.fn();
const mockLogCollapseSmartSnippetSuggestion = vi.fn();
const mockLogOpenSmartSnippetSuggestionSource = vi.fn();
const mockLogOpenSmartSnippetSuggestionInlineLink = vi.fn();
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
  this.disable = vi.fn();
  this.logExpandSmartSnippet = mockLogExpandSmartSnippet;
  this.logCollapseSmartSnippet = mockLogCollapseSmartSnippet;
  this.logLikeSmartSnippet = mockLogLikeSmartSnippet;
  this.logDislikeSmartSnippet = mockLogDislikeSmartSnippet;
  this.logOpenSmartSnippetSource = mockLogOpenSmartSnippetSource;
  this.logOpenSmartSnippetInlineLink = mockLogOpenSmartSnippetInlineLink;
  this.logOpenSmartSnippetFeedbackModal = mockLogOpenSmartSnippetFeedbackModal;
  this.logCloseSmartSnippetFeedbackModal =
    mockLogCloseSmartSnippetFeedbackModal;
  this.logSmartSnippetFeedbackReason = mockLogSmartSnippetFeedback;
  this.logExpandSmartSnippetSuggestion = mockLogExpandSmartSnippetSuggestion;
  this.logCollapseSmartSnippetSuggestion =
    mockLogCollapseSmartSnippetSuggestion;
  this.logOpenSmartSnippetSuggestionSource =
    mockLogOpenSmartSnippetSuggestionSource;
  this.logOpenSmartSnippetSuggestionInlineLink =
    mockLogOpenSmartSnippetSuggestionInlineLink;
});

const exampleSearchUid = '456';
const exampleQuestion = 'Where am I?';
const exampleAnswerSnippet = 'You are here.';
const exampleScore = 9001;
const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const examplePermanentId = 'example permanent id';
const exampleQuestionAnswerId = 'foo';
const exampleFeedback = 'does_not_answer';
const exampleFeedbackDetails = 'example feedback details';

const exampleRelatedQuestion = {
  question: 'example question',
  answerSnippet: 'example answer',
  documentId: {
    contentIdKey: 'permanentid',
    contentIdValue: examplePermanentId,
  },
  score: 1,
};

const exampleQuestionAnswer = {
  question: exampleQuestion,
  answerSnippet: exampleAnswerSnippet,
  documentId: {
    contentIdKey: 'permanentid',
    contentIdValue: examplePermanentId,
  },
  score: exampleScore,
};

const exampleQuestionAnsweringState = {
  liked: false,
  disliked: false,
  expanded: false,
  feedbackModalOpen: false,
  questionAnswerId: 'bar',
};

const exampleRelatedQuestionState = {
  expanded: false,
  questionAnswerId: exampleQuestionAnswerId,
  contentIdKey: 'permanentid',
  contentIdValue: examplePermanentId,
};

const expectedCaseContext = {
  caseContext: {
    Case_Subject: exampleSubject,
    Case_Description: exampleDescription,
  },
  caseId: exampleCaseId,
  caseNumber: exampleCaseNumber,
};

const expectedDocumentInfo = {
  queryPipeline: '',
  documentUri: 'example documentUri',
  documentUriHash: 'example documentUriHash',
  collectionName: 'example collectionName',
  sourceName: 'example sourceName',
  documentPosition: 1,
  documentTitle: 'example documentTitle',
  documentUrl: 'example documentUrl',
  rankingModifier: 'example rankingModifier',
  documentAuthor: 'unknown',
};

const resultParams = {
  title: 'example documentTitle',
  uri: 'example documentUri',
  printableUri: 'printable-uri',
  clickUri: 'example documentUrl',
  rankingModifier: 'example rankingModifier',
  raw: buildMockRaw({
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: examplePermanentId,
  }),
};
const exampleResult = buildMockResult(resultParams);

const exampleInlineLink = {
  linkText: 'example link text',
  linkURL: 'example link url',
};

describe('question answering insight analytics actions', () => {
  let engine: MockedInsightEngine;
  const searchState = buildMockSearchState({
    response: buildMockSearchResponse({
      searchUid: exampleSearchUid,
    }),
    results: [exampleResult],
    questionAnswer: {
      ...emptyQuestionAnswer(),
      ...exampleQuestionAnswer,
      relatedQuestions: [exampleRelatedQuestion],
    },
  });
  const questionAnsweringState = {
    ...getQuestionAnsweringInitialState(),
    ...exampleQuestionAnsweringState,
    relatedQuestions: [exampleRelatedQuestionState],
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
          questionAnswering: questionAnsweringState,
          insightCaseContext: insightCaseContextState,
        })
      );
    });

    it('should log #logExpandSmartSnippet with the case payload', async () => {
      await logExpandSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogExpandSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logCollapseSmartSnippet with the case payload', async () => {
      await logCollapseSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogCollapseSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logLikeSmartSnippet with the case payload', async () => {
      await logLikeSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogLikeSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logDislikeSmartSnippet with the case payload', async () => {
      await logDislikeSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogDislikeSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logOpenSmartSnippetSource with the right payload', async () => {
      await logOpenSmartSnippetSource()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogOpenSmartSnippetSource;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual({
        contentIDKey: exampleQuestionAnswer.documentId.contentIdKey,
        contentIDValue: exampleQuestionAnswer.documentId.contentIdValue,
      });
      expect(mockToUse.mock.calls[0][2]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logOpenSmartSnippetInlineLink with the right payload', async () => {
      await logOpenSmartSnippetInlineLink(exampleInlineLink)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogOpenSmartSnippetInlineLink;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual({
        contentIDKey: exampleQuestionAnswer.documentId.contentIdKey,
        contentIDValue: exampleQuestionAnswer.documentId.contentIdValue,
        ...exampleInlineLink,
      });
      expect(mockToUse.mock.calls[0][2]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logOpenSmartSnippetFeedbackModal with the case payload', async () => {
      await logOpenSmartSnippetFeedbackModal()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogOpenSmartSnippetFeedbackModal;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logCloseSmartSnippetFeedbackModal with the case payload', async () => {
      await logCloseSmartSnippetFeedbackModal()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogCloseSmartSnippetFeedbackModal;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logSmartSnippetFeedback with the right payload', async () => {
      await logSmartSnippetFeedback(exampleFeedback)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockLogSmartSnippetFeedback;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(exampleFeedback);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(undefined);
      expect(mockToUse.mock.calls[0][2]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logSmartSnippetDetailedFeedback with the right payload', async () => {
      await logSmartSnippetDetailedFeedback(exampleFeedbackDetails)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const expectedFeedbackReason = 'other';

      const mockToUse = mockLogSmartSnippetFeedback;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedFeedbackReason);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(exampleFeedbackDetails);
      expect(mockToUse.mock.calls[0][2]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logExpandSmartSnippetSuggestion with the right payload', async () => {
      await logExpandSmartSnippetSuggestion({
        questionAnswerId: exampleQuestionAnswerId,
      })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      const expectedRelatedQuestionPayload = {
        question: exampleRelatedQuestion.question,
        answerSnippet: exampleRelatedQuestion.answerSnippet,
        documentId: exampleRelatedQuestion.documentId,
      };

      const mockToUse = mockLogExpandSmartSnippetSuggestion;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(
        expectedRelatedQuestionPayload
      );
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logCollapseSmartSnippetSuggestion with the right payload', async () => {
      await logCollapseSmartSnippetSuggestion({
        questionAnswerId: exampleQuestionAnswerId,
      })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      const expectedRelatedQuestionPayload = {
        question: exampleRelatedQuestion.question,
        answerSnippet: exampleRelatedQuestion.answerSnippet,
        documentId: exampleRelatedQuestion.documentId,
      };

      const mockToUse = mockLogCollapseSmartSnippetSuggestion;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(
        expectedRelatedQuestionPayload
      );
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logOpenSmartSnippetSuggestionSource with the right payload', async () => {
      await logOpenSmartSnippetSuggestionSource({
        questionAnswerId: exampleQuestionAnswerId,
      })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      const expectedRelatedQuestionPayload = {
        question: exampleRelatedQuestion.question,
        answerSnippet: exampleRelatedQuestion.answerSnippet,
        documentId: exampleRelatedQuestion.documentId,
      };

      const mockToUse = mockLogOpenSmartSnippetSuggestionSource;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(
        expectedRelatedQuestionPayload
      );
      expect(mockToUse.mock.calls[0][2]).toStrictEqual(expectedCaseContext);
    });

    it('should log #logOpenSmartSnippetSuggestionInlineLink with the right payload', async () => {
      await logOpenSmartSnippetSuggestionInlineLink(
        {questionAnswerId: exampleQuestionAnswerId},
        exampleInlineLink
      )()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      const expectedRelatedQuestionPayload = {
        question: exampleRelatedQuestion.question,
        answerSnippet: exampleRelatedQuestion.answerSnippet,
        documentId: exampleRelatedQuestion.documentId,
      };

      const mockToUse = mockLogOpenSmartSnippetSuggestionInlineLink;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual({
        ...expectedRelatedQuestionPayload,
        ...exampleInlineLink,
      });
      expect(mockToUse.mock.calls[0][2]).toStrictEqual(expectedCaseContext);
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
          questionAnswering: questionAnsweringState,
          insightCaseContext: insightCaseContextState,
        })
      );
    });

    it('should log #logExpandSmartSnippet with the case payload', async () => {
      await logExpandSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logCollapseSmartSnippet with the case payload', async () => {
      await logCollapseSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logLikeSmartSnippet with the case payload', async () => {
      await logLikeSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logDislikeSmartSnippet with the case payload', async () => {
      await logDislikeSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logOpenSmartSnippetSource with the right payload', async () => {
      await logOpenSmartSnippetSource()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logOpenSmartSnippetInlineLink with the right payload', async () => {
      await logOpenSmartSnippetInlineLink(exampleInlineLink)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logSmartSnippetFeedback with the right payload', async () => {
      await logSmartSnippetFeedback(exampleFeedback)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logSmartSnippetDetailedFeedback with the right payload', async () => {
      await logSmartSnippetDetailedFeedback(exampleFeedbackDetails)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logExpandSmartSnippetSuggestion with the right payload', async () => {
      await logExpandSmartSnippetSuggestion({
        questionAnswerId: exampleQuestionAnswerId,
      })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logCollapseSmartSnippetSuggestion with the right payload', async () => {
      await logCollapseSmartSnippetSuggestion({
        questionAnswerId: exampleQuestionAnswerId,
      })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logOpenSmartSnippetSuggestionSource with the right payload', async () => {
      await logOpenSmartSnippetSuggestionSource({
        questionAnswerId: exampleQuestionAnswerId,
      })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });

    it('should log #logOpenSmartSnippetSuggestionInlineLink with the right payload', async () => {
      await logOpenSmartSnippetSuggestionInlineLink(
        {questionAnswerId: exampleQuestionAnswerId},
        exampleInlineLink
      )()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0]).toMatchSnapshot();
    });
  });
});
