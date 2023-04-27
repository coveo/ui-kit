import {buildMockInsightEngine} from '../../test/mock-engine';
import {buildMockInsightState} from '../../test/mock-insight-state';
import {logResultsSort} from './sort-criteria-insight-analytics-actions';

const mockLogResultsSort = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logResultsSort: mockLogResultsSort,
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
