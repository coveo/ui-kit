import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockInsightEngine} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {logClearBreadcrumbs} from './facet-generic-insight-analytics-actions';

const mockLogBreadcrumbResetAll = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logBreadcrumbResetAll: mockLogBreadcrumbResetAll,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
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
