import * as CoveoAnalytics from 'coveo.analytics';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {buildMockInsightEngine} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {logCategoryFacetBreadcrumb} from './category-facet-set-insight-analytics-actions';

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
const examplePath = ['one', 'two'];

describe('logBreadcrumbFacet', () => {
  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const engine = buildMockInsightEngine({
      state: buildMockInsightState({
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
      }),
    });

    await engine.dispatch(
      logCategoryFacetBreadcrumb({
        categoryFacetId: exampleFacetId,
        categoryFacetPath: examplePath,
      })
    );

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
