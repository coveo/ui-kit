import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockRaw, buildMockResult} from '../../test';
import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockSearchState} from '../../test/mock-search-state';
import {logDocumentOpen} from './result-insight-analytics-actions';

const mockLogDocumentOpen = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logDocumentOpen: mockLogDocumentOpen,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
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
  excerpt: 'exceprt',
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

describe('logDocumentOpen', () => {
  it('should log #logDocumentOpen with the right payload', async () => {
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

    await engine.dispatch(logDocumentOpen(testResult));

    expect(mockLogDocumentOpen).toBeCalledTimes(1);
    expect(mockLogDocumentOpen.mock.calls[0][0]).toStrictEqual(
      expectedDocumentInfo
    );
    expect(mockLogDocumentOpen.mock.calls[0][1]).toStrictEqual(
      expectedDocumentIdentifier
    );
    expect(mockLogDocumentOpen.mock.calls[0][2]).toStrictEqual(
      expectedMetadata
    );
  });
});
