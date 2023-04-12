import * as CoveoAnalytics from 'coveo.analytics';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockRaw} from '../../test/mock-raw';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchState} from '../../test/mock-search-state';
import {emptyQuestionAnswer} from '../search/search-state';
import {
  logExpandSmartSnippetSuggestion,
  logCollapseSmartSnippetSuggestion,
  logOpenSmartSnippetSuggestionSource,
  logOpenSmartSnippetSuggestionInlineLink,
} from './question-answering-insight-analytics-actions';
import {getQuestionAnsweringInitialState} from './question-answering-state';

const mockLogExpandSmartSnippetSuggestion = jest.fn();
const mockLogCollapseSmartSnippetSuggestion = jest.fn();
const mockLogOpenSmartSnippetSuggestionSource = jest.fn();
const mockLogOpenSmartSnippetSuggestionInlineLink = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logExpandSmartSnippetSuggestion: mockLogExpandSmartSnippetSuggestion,
  logCollapseSmartSnippetSuggestion: mockLogCollapseSmartSnippetSuggestion,
  logOpenSmartSnippetSuggestionSource: mockLogOpenSmartSnippetSuggestionSource,
  logOpenSmartSnippetSuggestionInlineLink:
    mockLogOpenSmartSnippetSuggestionInlineLink,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const examplePermanentId = 'example permanent id';
const exampleQuestionAnswerId = '1';

const exampleRelatedQuestion = {
  question: 'example question',
  answerSnippet: 'example answer',
  documentId: {
    contentIdKey: 'permanentid',
    contentIdValue: examplePermanentId,
  },
  score: 1,
};

const exampleRelatedQuestionState = {
  // ...exampleRelatedQuestion,
  expanded: false,
  questionAnswerId: exampleQuestionAnswerId,
  contentIdKey: 'permanantid',
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
  let engine: MockInsightEngine;

  beforeAll(() => {
    engine = buildMockInsightEngine({
      state: buildMockInsightState({
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
          relatedQuestions: [exampleRelatedQuestionState],
        },
        search: buildMockSearchState({
          results: [exampleResult],
          questionAnswer: {
            ...emptyQuestionAnswer(),
            relatedQuestions: [exampleRelatedQuestion],
          },
        }),
      }),
    });
  });

  it('should log #logExpandeSmartSnippetSuggestion with the right payload', async () => {
    await engine.dispatch(
      logExpandSmartSnippetSuggestion({
        questionAnswerId: exampleQuestionAnswerId,
      })
    );
    const expectedRelatedQuestionPayload = {
      question: exampleRelatedQuestion.question,
      answerSnippet: exampleRelatedQuestion.answerSnippet,
      documentId: exampleRelatedQuestion.documentId,
    };

    expect(mockLogExpandSmartSnippetSuggestion).toBeCalledTimes(1);
    expect(mockLogExpandSmartSnippetSuggestion.mock.calls[0][0]).toStrictEqual(
      expectedRelatedQuestionPayload
    );
    expect(mockLogExpandSmartSnippetSuggestion.mock.calls[0][1]).toStrictEqual(
      expectedCaseContext
    );
  });

  it('should log #logCollapseSmartSnippetSuggestion with the right payload', async () => {
    await engine.dispatch(
      logCollapseSmartSnippetSuggestion({
        questionAnswerId: exampleQuestionAnswerId,
      })
    );

    const expectedRelatedQuestionPayload = {
      question: exampleRelatedQuestion.question,
      answerSnippet: exampleRelatedQuestion.answerSnippet,
      documentId: exampleRelatedQuestion.documentId,
    };

    expect(mockLogCollapseSmartSnippetSuggestion).toBeCalledTimes(1);
    expect(
      mockLogCollapseSmartSnippetSuggestion.mock.calls[0][0]
    ).toStrictEqual(expectedRelatedQuestionPayload);
    expect(
      mockLogCollapseSmartSnippetSuggestion.mock.calls[0][1]
    ).toStrictEqual(expectedCaseContext);
  });

  it('should log #logOpenSmartSnippetSuggestionSource with the right payload', async () => {
    await engine.dispatch(
      logOpenSmartSnippetSuggestionSource({
        questionAnswerId: exampleQuestionAnswerId,
      })
    );

    const expectedRelatedQuestionPayload = {
      question: exampleRelatedQuestion.question,
      answerSnippet: exampleRelatedQuestion.answerSnippet,
      documentId: exampleRelatedQuestion.documentId,
    };

    expect(mockLogOpenSmartSnippetSuggestionSource).toBeCalledTimes(1);
    expect(
      mockLogOpenSmartSnippetSuggestionSource.mock.calls[0][0]
    ).toStrictEqual(expectedDocumentInfo);
    expect(
      mockLogOpenSmartSnippetSuggestionSource.mock.calls[0][1]
    ).toStrictEqual(expectedRelatedQuestionPayload);
    expect(
      mockLogOpenSmartSnippetSuggestionSource.mock.calls[0][2]
    ).toStrictEqual(expectedCaseContext);
  });

  it('should log #logOpenSmartSnippetSuggestionInlineLink with the right payload', async () => {
    await engine.dispatch(
      logOpenSmartSnippetSuggestionInlineLink(
        {questionAnswerId: exampleQuestionAnswerId},
        exampleInlineLink
      )
    );

    const expectedRelatedQuestionPayload = {
      question: exampleRelatedQuestion.question,
      answerSnippet: exampleRelatedQuestion.answerSnippet,
      documentId: exampleRelatedQuestion.documentId,
    };

    expect(mockLogOpenSmartSnippetSuggestionInlineLink).toBeCalledTimes(1);
    expect(
      mockLogOpenSmartSnippetSuggestionInlineLink.mock.calls[0][0]
    ).toStrictEqual(expectedDocumentInfo);
    expect(
      mockLogOpenSmartSnippetSuggestionInlineLink.mock.calls[0][1]
    ).toStrictEqual({...expectedRelatedQuestionPayload, ...exampleInlineLink});
    expect(
      mockLogOpenSmartSnippetSuggestionInlineLink.mock.calls[0][2]
    ).toStrictEqual(expectedCaseContext);
  });
});
