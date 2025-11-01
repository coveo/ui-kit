import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../../../app/thunk-extra-arguments.js';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request.js';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {buildMockInsightEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../../test/mock-insight-state.js';
import {getConfigurationInitialState} from '../../../configuration/configuration-state.js';
import {logDateFacetBreadcrumb} from './date-facet-insight-analytics-actions.js';

const mockLogBreadcrumbFacet = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logBreadcrumbFacet = mockLogBreadcrumbFacet;
});

describe('date facet insight analytics actions', () => {
  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';
  const exampleFacetId = 'exampleFacetId';
  const exampleField = 'exampleField';
  const exampleEndInclusiveValue = true;
  const exampleStartValue = 'start';
  const exampleEndValue = 'end';

  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const configuration = getConfigurationInitialState();
    configuration.analytics.analyticsMode = 'legacy';
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        dateFacetSet: {
          [exampleFacetId]: buildMockDateFacetSlice({
            request: buildMockDateFacetRequest({
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

    await logDateFacetBreadcrumb({
      facetId: exampleFacetId,
      selection: buildMockDateFacetValue({
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
      facetRangeEnd: exampleEndValue,
      facetRangeStart: exampleStartValue,
    };

    expect(mockLogBreadcrumbFacet).toBeCalledTimes(1);
    expect(mockLogBreadcrumbFacet.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
