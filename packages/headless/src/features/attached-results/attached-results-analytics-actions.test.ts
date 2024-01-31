import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockRaw} from '../../test/mock-raw';
import {buildMockResult} from '../../test/mock-result';
import {buildMockSearchState} from '../../test/mock-search-state';
import {
  logCaseAttach,
  logCaseDetach,
} from './attached-results-analytics-actions';

const mockLogCaseAttach = jest.fn();
const mockLogCaseDetach = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logCaseAttach: mockLogCaseAttach,
    logCaseDetach: mockLogCaseDetach,
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

describe('logCaseAttach', () => {
  it('should log #logCaseAttach with the right payload', async () => {
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
    await engine.dispatch(logCaseAttach(testResult));

    expect(mockLogCaseAttach).toBeCalledTimes(1);
    expect(mockLogCaseAttach.mock.calls[0][0]).toStrictEqual(
      expectedDocumentInfo
    );
    expect(mockLogCaseAttach.mock.calls[0][1]).toStrictEqual(
      expectedDocumentIdentifier
    );
    expect(mockLogCaseAttach.mock.calls[0][2]).toStrictEqual(expectedMetadata);
  });
});

describe('logCaseDetach', () => {
  it('should log #logCaseDetach with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
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
    await engine.dispatch(logCaseDetach(testResult.raw.urihash));

    expect(mockLogCaseDetach).toBeCalledTimes(1);
    expect(mockLogCaseDetach.mock.calls[0][0]).toStrictEqual(
      testResult.raw.urihash
    );
    expect(mockLogCaseDetach.mock.calls[0][1]).toStrictEqual(expectedMetadata);
  });
});
