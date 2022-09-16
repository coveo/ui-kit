import {buildMockInsightState} from '../../test/mock-insight-state';
import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../test/mock-engine';
import {logResultsSort} from './sort-criteria-insight-analytics-actions';

const mockLogResultsSort = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logResultsSort: mockLogResultsSort,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleSortCriteria = 'exampleSortCriteria';

describe('logResultsSort', () => {
  it('should log #logResultsSort with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
        sortCriteria: exampleSortCriteria,
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

    await engine.dispatch(logResultsSort());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      resultsSortBy: exampleSortCriteria,
    };

    expect(mockLogResultsSort).toBeCalledTimes(1);
    expect(mockLogResultsSort.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});
