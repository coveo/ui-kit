import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../../../app/thunk-extra-arguments.js';
import {buildMockInsightEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../../test/mock-insight-state.js';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request.js';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice.js';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import {getConfigurationInitialState} from '../../../configuration/configuration-state.js';
import {logNumericFacetBreadcrumb} from './numeric-facet-insight-analytics-actions.js';

const mockLogBreadcrumbFacet = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logBreadcrumbFacet = mockLogBreadcrumbFacet;
});

describe('numeric facet insight analytics actions', () => {
  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';
  const exampleFacetId = 'exampleFacetId';
  const exampleField = 'exampleField';
  const exampleEndInclusiveValue = true;
  const exampleStartValue = 0;
  const exampleEndValue = 10;

  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const configuration = getConfigurationInitialState();
    configuration.analytics.analyticsMode = 'legacy';
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        numericFacetSet: {
          [exampleFacetId]: buildMockNumericFacetSlice({
            request: buildMockNumericFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          }),
        },
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

    await logNumericFacetBreadcrumb({
      facetId: exampleFacetId,
      selection: buildMockNumericFacetValue({
        endInclusive: exampleEndInclusiveValue,
        end: exampleEndValue,
        start: exampleStartValue,
      }),
    })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: exampleCaseId,
      caseNumber: exampleCaseNumber,
      facetId: exampleFacetId,
      facetField: exampleField,
      facetTitle: `${exampleField}_${exampleFacetId}`,
      facetRangeEndInclusive: exampleEndInclusiveValue,
      facetRangeEnd: `${exampleEndValue}`,
      facetRangeStart: `${exampleStartValue}`,
    };

    expect(mockLogBreadcrumbFacet).toBeCalledTimes(1);
    expect(mockLogBreadcrumbFacet.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
