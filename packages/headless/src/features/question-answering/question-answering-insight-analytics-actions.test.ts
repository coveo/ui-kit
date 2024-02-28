import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  buildMockInsightEngine,
  MockedInsightEngine,
} from '../../test/mock-engine-v2';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockRaw} from '../../test/mock-raw';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchState} from '../../test/mock-search-state';
import {emptyQuestionAnswer} from '../search/search-state';
import {
  logExpandSmartSnippet,
  logExpandSmartSnippetSuggestion,
  logCollapseSmartSnippetSuggestion,
  logOpenSmartSnippetSuggestionSource,
  logOpenSmartSnippetSuggestionInlineLink,
  logCollapseSmartSnippet,
  logLikeSmartSnippet,
  logDislikeSmartSnippet,
  logOpenSmartSnippetSource,
  logOpenSmartSnippetInlineLink,
  logOpenSmartSnippetFeedbackModal,
  logCloseSmartSnippetFeedbackModal,
  logSmartSnippetFeedback,
  logSmartSnippetDetailedFeedback,
} from './question-answering-insight-analytics-actions';
import {getQuestionAnsweringInitialState} from './question-answering-state';

const mockLogExpandSmartSnippet = jest.fn();
const mockLogCollapseSmartSnippet = jest.fn();
const mockLogLikeSmartSnippet = jest.fn();
const mockLogDislikeSmartSnippet = jest.fn();
const mockLogOpenSmartSnippetSource = jest.fn();
const mockLogOpenSmartSnippetInlineLink = jest.fn();
const mockLogOpenSmartSnippetFeedbackModal = jest.fn();
const mockLogCloseSmartSnippetFeedbackModal = jest.fn();
const mockLogSmartSnippetFeedback = jest.fn();
const mockLogSmartSnippetDetailedFeedback = jest.fn();
const mockLogExpandSmartSnippetSuggestion = jest.fn();
const mockLogCollapseSmartSnippetSuggestion = jest.fn();
const mockLogOpenSmartSnippetSuggestionSource = jest.fn();
const mockLogOpenSmartSnippetSuggestionInlineLink = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: jest.fn(),
    logExpandSmartSnippet: mockLogExpandSmartSnippet,
    logCollapseSmartSnippet: mockLogCollapseSmartSnippet,
    logLikeSmartSnippet: mockLogLikeSmartSnippet,
    logDislikeSmartSnippet: mockLogDislikeSmartSnippet,
    logOpenSmartSnippetSource: mockLogOpenSmartSnippetSource,
    logOpenSmartSnippetInlineLink: mockLogOpenSmartSnippetInlineLink,
    logOpenSmartSnippetFeedbackModal: mockLogOpenSmartSnippetFeedbackModal,
    logCloseSmartSnippetFeedbackModal: mockLogCloseSmartSnippetFeedbackModal,
    logSmartSnippetFeedbackReason: mockLogSmartSnippetFeedback,
    logSmartSnippetDetailedFeedback: mockLogSmartSnippetDetailedFeedback,
    logExpandSmartSnippetSuggestion: mockLogExpandSmartSnippetSuggestion,
    logCollapseSmartSnippetSuggestion: mockLogCollapseSmartSnippetSuggestion,
    logOpenSmartSnippetSuggestionSource:
      mockLogOpenSmartSnippetSuggestionSource,
    logOpenSmartSnippetSuggestionInlineLink:
      mockLogOpenSmartSnippetSuggestionInlineLink,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleQuestion = 'Where am I?';
const exampleAnswerSnippet = 'You are here.';
const exampleScore = 9001;
const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const examplePermanentId = 'example permanent id';
const exampleQuestionAnswerId = '1';
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
  questionAnsweringId: 1,
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

describe('the analytics related to the question answering feature in the insight use case', () => {
  let engine: MockedInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine(
      buildMockInsightState({
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
        questionAnswering: {
          ...getQuestionAnsweringInitialState(),
          ...exampleQuestionAnsweringState,
          relatedQuestions: [exampleRelatedQuestionState],
        },
        search: buildMockSearchState({
          results: [exampleResult],
          questionAnswer: {
            ...emptyQuestionAnswer(),
            ...exampleQuestionAnswer,
            relatedQuestions: [exampleRelatedQuestion],
          },
        }),
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
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
