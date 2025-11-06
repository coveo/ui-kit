import {createRelay} from '@coveo/relay';
import {CoveoSearchPageClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {buildMockRaw} from '../../test/mock-raw.js';
import {buildMockResult} from '../../test/mock-result.js';
import {buildMockSearchResponse} from '../../test/mock-search-response.js';
import {buildMockSearchState} from '../../test/mock-search-state.js';
import {createMockState} from '../../test/mock-state.js';
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
} from './question-answering-analytics-actions.js';
import {getQuestionAnsweringInitialState} from './question-answering-state.js';

const mockLogFunction = vi.fn();
const mockMakeExpandSmartSnippet = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeCollapseSmartSnippet = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeLikeSmartSnippet = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeDislikeSmartSnippet = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetSource = vi.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetInlineLink = vi.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetFeedbackModal = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeCloseSmartSnippetFeedbackModal = vi.fn(() => ({
  log: mockLogFunction,
}));
const mockMakeSmartSnippetFeedback = vi.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeExpandSmartSnippetSuggestion = vi.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeCollapseSmartSnippetSuggestion = vi.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetSuggestionSource = vi.fn((..._args) => ({
  log: mockLogFunction,
}));
const mockMakeOpenSmartSnippetSuggestionInlineLink = vi.fn((..._args) => ({
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
vi.mocked(CoveoSearchPageClient).mockImplementation(function () {
  this.disable = vi.fn();
  this.makeExpandSmartSnippet =
    mockMakeExpandSmartSnippet as unknown as typeof this.makeExpandSmartSnippet;
  this.makeCollapseSmartSnippet =
    mockMakeCollapseSmartSnippet as unknown as typeof this.makeCollapseSmartSnippet;
  this.makeLikeSmartSnippet =
    mockMakeLikeSmartSnippet as unknown as typeof this.makeLikeSmartSnippet;
  this.makeDislikeSmartSnippet =
    mockMakeDislikeSmartSnippet as unknown as typeof this.makeDislikeSmartSnippet;
  this.makeOpenSmartSnippetSource =
    mockMakeOpenSmartSnippetSource as unknown as typeof this.makeOpenSmartSnippetSource;
  this.makeOpenSmartSnippetInlineLink =
    mockMakeOpenSmartSnippetInlineLink as unknown as typeof this.makeOpenSmartSnippetInlineLink;
  this.makeOpenSmartSnippetFeedbackModal =
    mockMakeOpenSmartSnippetFeedbackModal as unknown as typeof this.makeOpenSmartSnippetFeedbackModal;
  this.makeCloseSmartSnippetFeedbackModal =
    mockMakeCloseSmartSnippetFeedbackModal as unknown as typeof this.makeCloseSmartSnippetFeedbackModal;
  this.makeSmartSnippetFeedbackReason =
    mockMakeSmartSnippetFeedback as unknown as typeof this.makeSmartSnippetFeedbackReason;
  this.makeExpandSmartSnippetSuggestion =
    mockMakeExpandSmartSnippetSuggestion as unknown as typeof this.makeExpandSmartSnippetSuggestion;
  this.makeCollapseSmartSnippetSuggestion =
    mockMakeCollapseSmartSnippetSuggestion as unknown as typeof this.makeCollapseSmartSnippetSuggestion;
  this.makeOpenSmartSnippetSuggestionSource =
    mockMakeOpenSmartSnippetSuggestionSource as unknown as typeof this.makeOpenSmartSnippetSuggestionSource;
  this.makeOpenSmartSnippetSuggestionInlineLink =
    mockMakeOpenSmartSnippetSuggestionInlineLink as unknown as typeof this.makeOpenSmartSnippetSuggestionInlineLink;
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
    vi.clearAllMocks();
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
