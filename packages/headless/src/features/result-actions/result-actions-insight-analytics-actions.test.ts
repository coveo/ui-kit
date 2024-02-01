import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockRaw} from '../../test/mock-raw';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchState} from '../../test/mock-search-state';
import {
  logCaseSendEmail,
  logCopyToClipboard,
  logFeedItemTextPost,
} from './result-actions-insight-analytics-actions';

const mockLogCopyToClipboard = jest.fn();
const mockLogCaseSendEmail = jest.fn();
const mockLogFeedItemTextPost = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logCopyToClipboard: mockLogCopyToClipboard,
    logCaseSendEmail: mockLogCaseSendEmail,
    logFeedItemTextPost: mockLogFeedItemTextPost,
  }));

  return {
    CoveoInsightClient: mockCoveoInsightClient,
    history: {HistoryStore: jest.fn()},
  };
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';

const expectedMetadata = {
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

const expectedDocumentIdentifier = {
  contentIDKey: 'permanentid',
  contentIDValue: 'example contentIDValue',
};

const resultParams = {
  title: 'example documentTitle',
  uri: 'example documentUri',
  printableUri: 'printable-uri',
  clickUri: 'example documentUrl',
  uniqueId: 'unique-id',
  excerpt: 'excerpt',
  firstSentences: 'first-sentences',
  flags: 'flags',
  rankingModifier: 'example rankingModifier',
  raw: buildMockRaw({
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: 'example contentIDValue',
  }),
};

const testResult = buildMockResult(resultParams);

describe('logCopyToClipboard', () => {
  it('should log #logCopyToClipboard with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        search: buildMockSearchState({
          results: [testResult],
        }),
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });
    await engine.dispatch(logCopyToClipboard(testResult));

    expect(mockLogCopyToClipboard).toBeCalledTimes(1);
    expect(mockLogCopyToClipboard.mock.calls[0][0]).toStrictEqual(
      expectedDocumentInfo
    );
    expect(mockLogCopyToClipboard.mock.calls[0][1]).toStrictEqual(
      expectedDocumentIdentifier
    );
    expect(mockLogCopyToClipboard.mock.calls[0][2]).toStrictEqual(
      expectedMetadata
    );
  });
});

describe('logCaseSendEmail', () => {
  it('should log #logCaseSendEmail with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        search: buildMockSearchState({
          results: [testResult],
        }),
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });
    await engine.dispatch(logCaseSendEmail(testResult));

    expect(mockLogCaseSendEmail).toBeCalledTimes(1);
    expect(mockLogCaseSendEmail.mock.calls[0][0]).toStrictEqual(
      expectedDocumentInfo
    );
    expect(mockLogCaseSendEmail.mock.calls[0][1]).toStrictEqual(
      expectedDocumentIdentifier
    );
    expect(mockLogCaseSendEmail.mock.calls[0][2]).toStrictEqual(
      expectedMetadata
    );
  });
});

describe('logFeedItemTextPost', () => {
  it('should log #logFeedItemTextPost with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        search: buildMockSearchState({
          results: [testResult],
        }),
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      }),
    });
    await engine.dispatch(logFeedItemTextPost(testResult));

    expect(mockLogFeedItemTextPost).toBeCalledTimes(1);
    expect(mockLogFeedItemTextPost.mock.calls[0][0]).toStrictEqual(
      expectedDocumentInfo
    );
    expect(mockLogFeedItemTextPost.mock.calls[0][1]).toStrictEqual(
      expectedDocumentIdentifier
    );
    expect(mockLogFeedItemTextPost.mock.calls[0][2]).toStrictEqual(
      expectedMetadata
    );
  });
});
