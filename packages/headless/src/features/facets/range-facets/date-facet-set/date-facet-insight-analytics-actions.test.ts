import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockDateFacetRequest} from '../../../../test/mock-date-facet-request';
import {buildMockDateFacetSlice} from '../../../../test/mock-date-facet-slice';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {buildMockInsightEngine} from '../../../../test/mock-engine';
import {buildMockInsightState} from '../../../../test/mock-insight-state';
import {logDateFacetBreadcrumb} from './date-facet-insight-analytics-actions';

const mockLogBreadcrumbFacet = jest.fn();

const mockCoveoInsightClient = jest.fn(() => ({
  disable: () => {},
  logBreadcrumbFacet: mockLogBreadcrumbFacet,
}));

Object.defineProperty(CoveoAnalytics, 'CoveoInsightClient', {
  value: mockCoveoInsightClient,
});

const exampleSubject = 'example subject';
const exampleDescription = 'example description';
const exampleCaseId = '1234';
const exampleCaseNumber = '5678';
const exampleFacetId = 'exampleFacetId';
const exampleField = 'exampleField';
const exampleEndInclusiveValue = true;
const exampleStartValue = 'start';
const exampleEndValue = 'end';

describe('logBreadcrumbFacet', () => {
  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
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
      }),
    });

    await engine.dispatch(
      logDateFacetBreadcrumb({
        facetId: exampleFacetId,
        selection: buildMockDateFacetValue({
          endInclusive: exampleEndInclusiveValue,
          end: exampleEndValue,
          start: exampleStartValue,
        }),
      })
    );

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
