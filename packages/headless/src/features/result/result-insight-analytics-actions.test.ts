import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {buildMockNonEmptyResult} from '../../test/mock-result';
import {buildMockSearchState} from '../../test/mock-search-state';
import {logDocumentOpen} from './result-insight-analytics-actions';

const mockLogDocumentOpen = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logDocumentOpen: mockLogDocumentOpen,
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

const testResult = buildMockNonEmptyResult();

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
