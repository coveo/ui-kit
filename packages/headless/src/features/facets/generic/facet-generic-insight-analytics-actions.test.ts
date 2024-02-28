import {ThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {logClearBreadcrumbs} from './facet-generic-insight-analytics-actions';

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
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        insightCaseContext: {
          caseContext: {
            Case_Subject: exampleSubject,
            Case_Description: exampleDescription,
          },
          caseId: exampleCaseId,
          caseNumber: exampleCaseNumber,
        },
      })
    );

    await logClearBreadcrumbs()()(
      engine.dispatch,
      () => engine.state,
      {} as ThunkExtraArguments
    );

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
    };

    expect(mockLogBreadcrumbResetAll).toHaveBeenCalledTimes(1);
    expect(mockLogBreadcrumbResetAll.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
