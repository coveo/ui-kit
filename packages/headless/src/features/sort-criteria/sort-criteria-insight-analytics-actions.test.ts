import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {buildMockInsightEngine} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {logResultsSort} from './sort-criteria-insight-analytics-actions.js';

const mockLogResultsSort = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logResultsSort = mockLogResultsSort;
});

describe('sort criteria insight analytics actions', () => {
  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';
  const exampleSortCriteria = 'exampleSortCriteria';

  it('should log #logResultsSort with the right payload', async () => {
    const configuration = getConfigurationInitialState();
    configuration.analytics.analyticsMode = 'legacy';
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        sortCriteria: exampleSortCriteria,
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
    await logResultsSort()()(
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
      resultsSortBy: exampleSortCriteria,
    };

    expect(mockLogResultsSort).toHaveBeenCalledTimes(1);
    expect(mockLogResultsSort.mock.calls[0][0]).toStrictEqual(expectedPayload);
  });
});
