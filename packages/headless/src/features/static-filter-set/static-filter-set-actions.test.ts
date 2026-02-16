import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {buildMockInsightEngine} from '../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../test/mock-insight-state.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {logInsightStaticFilterDeselect} from './static-filter-set-insight-analytics-actions.js';

const mockOriginalStaticFilterDeselect = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logStaticFilterDeselect = mockOriginalStaticFilterDeselect;
});

describe('static filter set actions', () => {
  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';
  const examplestaticFilterId = 'examplestaticFilterId';
  const examplestaticFilterValue = {caption: 'string', expression: 'string;'};

  it('should log #logStaticFilterDeselect with the right payload', async () => {
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
    await logInsightStaticFilterDeselect({
      staticFilterId: examplestaticFilterId,
      staticFilterValue: examplestaticFilterValue,
    })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      staticFilterValue: examplestaticFilterValue,
      staticFilterId: examplestaticFilterId,
    };

    expect(mockOriginalStaticFilterDeselect).toBeCalledTimes(1);
    expect(mockOriginalStaticFilterDeselect.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
