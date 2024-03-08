import {ThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockInsightEngine} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {logCategoryFacetBreadcrumb} from './category-facet-set-insight-analytics-actions';

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
const examplePath = ['one', 'two'];

describe('logBreadcrumbFacet', () => {
  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const engine = buildMockInsightEngine(
      buildMockInsightState({
        categoryFacetSet: {
          [exampleFacetId]: {
            initialNumberOfValues: 10,
            request: buildMockCategoryFacetRequest({
              facetId: exampleFacetId,
              field: exampleField,
            }),
          },
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

    await logCategoryFacetBreadcrumb({
      categoryFacetId: exampleFacetId,
      categoryFacetPath: examplePath,
    })()(engine.dispatch, () => engine.state, {} as ThunkExtraArguments);

    const expectedPayload = {
      caseContext: {
        Case_Subject: exampleSubject,
        Case_Description: exampleDescription,
      },
      caseId: '1234',
      caseNumber: '5678',
      categoryFacetId: exampleFacetId,
      categoryFacetPath: examplePath,
      categoryFacetField: exampleField,
      categoryFacetTitle: `${exampleField}_${exampleFacetId}`,
    };

    expect(mockLogBreadcrumbFacet).toBeCalledTimes(1);
    expect(mockLogBreadcrumbFacet.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
