import {testSearch, testInsight} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic breadcrumb manager ${useCase.label}`, () => {
    test.describe('when de-selecting a facet value', () => {
      test.describe('with regular facet values', () => {
        test('should trigger a new search and log analytics', async ({
          breadcrumbManager,
          search,
        }) => {
          const firstRegularFacetValue =
            await breadcrumbManager.firstRegularFacetValue;
          const searchResponsePromise = search.waitForSearchResponse();
          await breadcrumbManager.clickFirstRegularFacetLink();
          await searchResponsePromise;

          const secondSearchResponsePromise = search.waitForSearchResponse();
          const breadcrumbAnalyticsPromise =
            breadcrumbManager.waitForBreadcrumbFacetUaAnalytics({
              facetValue: firstRegularFacetValue,
            });
          await breadcrumbManager.clickFirstRegularFacetBreadcrumbValue();
          await secondSearchResponsePromise;
          await breadcrumbAnalyticsPromise;
        });
      });

      test.describe('with numeric facet values', () => {
        test('should trigger a new search and log analytics', async ({
          breadcrumbManager,
          search,
        }) => {
          const [facetRangeStart, facetRangeEnd] =
            (await breadcrumbManager.firstNumericFacetValue)?.split(' - ') ??
            [];
          const searchResponsePromise = search.waitForSearchResponse();
          await breadcrumbManager.clickFirstNumericFacetLink();
          await searchResponsePromise;

          const secondSearchResponsePromise = search.waitForSearchResponse();
          // We use the facet display value to compare, but the display value is localized and can contain non-numeric characters while the analytics request doesn't contain those characters.
          const breadcrumbAnalyticsPromise =
            breadcrumbManager.waitForBreadcrumbFacetUaAnalytics({
              facetRangeStart: facetRangeStart.replace(/[^\d]/g, ''),
              facetRangeEnd: facetRangeEnd.replace(/[^\d]/g, ''),
            });
          await breadcrumbManager.clickFirstNumericFacetBreadcrumbValue();
          await secondSearchResponsePromise;
          await breadcrumbAnalyticsPromise;
        });
      });
    });
    // test.describe('the clear all filters button', () => {
    //   test('should send a clear all filters analytics event and clear all selected facets values', async ({}) => {});
    // });
  });
});
