import {CoveoInsightClient} from 'coveo.analytics';
import type {ThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request.js';
import {buildMockInsightEngine} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {getConfigurationInitialState} from '../../configuration/configuration-state.js';
import {logCategoryFacetBreadcrumb} from './category-facet-set-insight-analytics-actions.js';

const mockLogBreadcrumbFacet = vi.fn();

vi.mock('coveo.analytics');
vi.mocked(CoveoInsightClient).mockImplementation(function () {
  this.disable = () => {};
  this.logBreadcrumbFacet = mockLogBreadcrumbFacet;
});

describe('category facet set insight analytics actions', () => {
  const exampleSubject = 'example subject';
  const exampleDescription = 'example description';
  const exampleCaseId = '1234';
  const exampleCaseNumber = '5678';
  const exampleFacetId = 'exampleFacetId';
  const exampleField = 'exampleField';
  const examplePath = ['one', 'two'];

  it('should log #logBreadcrumbFacet with the right payload', async () => {
    const configuration = getConfigurationInitialState();
    configuration.analytics.analyticsMode = 'legacy';
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
        configuration,
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

    expect(mockLogBreadcrumbFacet).toHaveBeenCalledTimes(1);
    expect(mockLogBreadcrumbFacet.mock.calls[0][0]).toStrictEqual(
      expectedPayload
    );
  });
});
