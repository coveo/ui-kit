import {createRelay} from '@coveo/relay';
import {ThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockRaw} from '../../test/mock-raw';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {buildMockSearchState} from '../../test/mock-search-state';
import {createMockState} from '../../test/mock-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
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
} from './question-answering-analytics-actions';
import {getQuestionAnsweringInitialState} from './question-answering-state';

const mockLogFunction = jest.fn();
const mockMakeExpandSmartSnippet = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeCollapseSmartSnippet = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeLikeSmartSnippet = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeDislikeSmartSnippet = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetSource = jest.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetInlineLink = jest.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetFeedbackModal = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeCloseSmartSnippetFeedbackModal = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeSmartSnippetFeedback = jest.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeSmartSnippetDetailedFeedback = jest.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeExpandSmartSnippetSuggestion = jest.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeCollapseSmartSnippetSuggestion = jest.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetSuggestionSource = jest.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetSuggestionInlineLink = jest.fn((..._args) => ({
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
  clearStorage: jest.fn(),
  version: 'foo',
});

jest.mock('coveo.analytics', () => {
  const mockCoveoSearchPageClient = jest.fn(() => ({
    disable: jest.fn(),
    makeExpandSmartSnippet: mockMakeExpandSmartSnippet,
    makeCollapseSmartSnippet: mockMakeCollapseSmartSnippet,
    makeLikeSmartSnippet: mockMakeLikeSmartSnippet,
    makeDislikeSmartSnippet: mockMakeDislikeSmartSnippet,
    makeOpenSmartSnippetSource: mockMakeOpenSmartSnippetSource,
    makeOpenSmartSnippetInlineLink: mockMakeOpenSmartSnippetInlineLink,
    makeOpenSmartSnippetFeedbackModal: mockMakeOpenSmartSnippetFeedbackModal,
    makeCloseSmartSnippetFeedbackModal: mockMakeCloseSmartSnippetFeedbackModal,
    makeSmartSnippetFeedbackReason: mockMakeSmartSnippetFeedback,
    makeSmartSnippetDetailedFeedback: mockMakeSmartSnippetDetailedFeedback,
    makeExpandSmartSnippetSuggestion: mockMakeExpandSmartSnippetSuggestion,
    makeCollapseSmartSnippetSuggestion: mockMakeCollapseSmartSnippetSuggestion,
    makeOpenSmartSnippetSuggestionSource:
      mockMakeOpenSmartSnippetSuggestionSource,
    makeOpenSmartSnippetSuggestionInlineLink:
      mockMakeOpenSmartSnippetSuggestionInlineLink,
  }));

  return {
    CoveoSearchPageClient: mockCoveoSearchPageClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleSearchUid = '456';
const exampleQuestion = 'Where am I?';
const exampleAnswerSnippet = 'You are here.';
const exampleScore = 9001;
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

describe('question answering analytics actions', () => {
  let engine: MockedSearchEngine;
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
          questionAnswering: questionAnsweringState,
        })
      );
    });

    it('should log #logExpandSmartSnippet with the case payload', async () => {
      await logExpandSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeExpandSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logCollapseSmartSnippet with the case payload', async () => {
      await logCollapseSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeCollapseSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logLikeSmartSnippet with the case payload', async () => {
      await logLikeSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeLikeSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logDislikeSmartSnippet with the case payload', async () => {
      await logDislikeSmartSnippet()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeDislikeSmartSnippet;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logOpenSmartSnippetSource with the right payload', async () => {
      await logOpenSmartSnippetSource()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeOpenSmartSnippetSource;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual({
        contentIDKey: exampleQuestionAnswer.documentId.contentIdKey,
        contentIDValue: exampleQuestionAnswer.documentId.contentIdValue,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logOpenSmartSnippetInlineLink with the right payload', async () => {
      await logOpenSmartSnippetInlineLink(exampleInlineLink)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeOpenSmartSnippetInlineLink;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual({
        contentIDKey: exampleQuestionAnswer.documentId.contentIdKey,
        contentIDValue: exampleQuestionAnswer.documentId.contentIdValue,
        ...exampleInlineLink,
      });
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logOpenSmartSnippetFeedbackModal with the case payload', async () => {
      await logOpenSmartSnippetFeedbackModal()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeOpenSmartSnippetFeedbackModal;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logCloseSmartSnippetFeedbackModal with the case payload', async () => {
      await logCloseSmartSnippetFeedbackModal()()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeCloseSmartSnippetFeedbackModal;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logSmartSnippetFeedback with the right payload', async () => {
      await logSmartSnippetFeedback(exampleFeedback)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const mockToUse = mockMakeSmartSnippetFeedback;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(exampleFeedback);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(undefined);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
    });

    it('should log #logSmartSnippetDetailedFeedback with the right payload', async () => {
      await logSmartSnippetDetailedFeedback(exampleFeedbackDetails)()(
        engine.dispatch,
        () => engine.state,
        {} as ThunkExtraArguments
      );

      const expectedFeedbackReason = 'other';

      const mockToUse = mockMakeSmartSnippetFeedback;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedFeedbackReason);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(exampleFeedbackDetails);
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
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

      const mockToUse = mockMakeExpandSmartSnippetSuggestion;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(
        expectedRelatedQuestionPayload
      );
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
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

      const mockToUse = mockMakeCollapseSmartSnippetSuggestion;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(
        expectedRelatedQuestionPayload
      );
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
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

      const mockToUse = mockMakeOpenSmartSnippetSuggestionSource;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual(
        expectedRelatedQuestionPayload
      );
      expect(mockLogFunction).toHaveBeenCalledTimes(1);
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

      const mockToUse = mockMakeOpenSmartSnippetSuggestionInlineLink;
      expect(mockToUse).toHaveBeenCalledTimes(1);
      expect(mockToUse.mock.calls[0][0]).toStrictEqual(expectedDocumentInfo);
      expect(mockToUse.mock.calls[0][1]).toStrictEqual({
        ...expectedRelatedQuestionPayload,
        ...exampleInlineLink,
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
          questionAnswering: questionAnsweringState,
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
