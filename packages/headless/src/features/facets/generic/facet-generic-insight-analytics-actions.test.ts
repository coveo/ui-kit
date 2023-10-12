import {buildMockInsightEngine} from '../../../test/mock-engine.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {logClearBreadcrumbs} from './facet-generic-insight-analytics-actions.js';

const mockLogBreadcrumbResetAll = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logBreadcrumbResetAll: mockLogBreadcrumbResetAll,
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

describe('logBreadcrumbResetAll', () => {
  it('should log #logBreadcrumbResetAll with the right payload', async () => {
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

    await engine.dispatch(logClearBreadcrumbs());

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogBreadcrumbResetAll).toBeCalledTimes(1);
    expect(mockLogBreadcrumbResetAll.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
