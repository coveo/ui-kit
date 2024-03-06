import {ThunkExtraArguments} from '../../../../app/thunk-extra-arguments';
import {buildMockInsightEngine} from '../../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../../test/mock-insight-state';
import {buildMockNumericFacetRequest} from '../../../../test/mock-numeric-facet-request';
import {buildMockNumericFacetSlice} from '../../../../test/mock-numeric-facet-slice';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {logNumericFacetBreadcrumb} from './numeric-facet-insight-analytics-actions';

const mockLogBreadcrumbFacet = jest.fn();

jest.mock('coveo.analytics', () => {
  const mockCoveoInsightClient = jest.fn(() => ({
    disable: () => {},
    logBreadcrumbFacet: mockLogBreadcrumbFacet,
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
const exampleFacetId = 'exampleFacetId';
const exampleField = 'exampleField';
const exampleEndInclusiveValue = true;
const exampleStartValue = 0;
const exampleEndValue = 10;

describe('logBreadcrumbFacet', () => {
  it('should log #logBreadcrumbFacet with the right payload', async () => {
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
