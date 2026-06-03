import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import {buildMockInsightEngine} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {getConfigurationInitialState} from '../../configuration/configuration-state.js';
import {logClearBreadcrumbs} from './facet-generic-insight-analytics-actions.js';

const mockLogBreadcrumbResetAll = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logBreadcrumbResetAll = mockLogBreadcrumbResetAll;
});

describe('facet generic insight analytics actions', () => {
  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';

  it('should log #logBreadcrumbResetAll with the right payload', async () => {
    const configuration = getConfigurationInitialState();
    configuration.analytics.analyticsMode = 'legacy';
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
        configuration,
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
