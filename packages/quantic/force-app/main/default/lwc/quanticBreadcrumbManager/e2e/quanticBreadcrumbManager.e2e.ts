import {testSearch, testInsight} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';
import {
  regularSelected,
  numericSelected,
  timeframeSelected,
  categorySelected,
  regularAndTimeframeSelected,
  allIdle,
} from './data';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const datetimeFacetLabelToValue = {
  'Past week': 'past-1-week..now',
  'Past month': 'past-1-month..now',
  'Past 6 months': 'past-6-month..now',
  'Past year': 'past-1-year..now',
  'Past decade': 'past-10-year..now',
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic breadcrumb manager ${useCase.label}`, () => {
    test.describe('when de-selecting a facet value', () => {
      test.describe('with regular facet values', () => {
        test.use({
          facetResponses: {
            responses: [allIdle, regularSelected, allIdle],
          },
        });
        test('should trigger a new search and log analytics', async ({
          breadcrumbManager,
          baseFacet,
        }) => {
          const firstRegularFacetValue =
            await breadcrumbManager.firstRegularFacetValue;
          const searchResponsePromise = baseFacet.waitForSearchResponse();
          await breadcrumbManager.clickFirstRegularFacetLink();
          await searchResponsePromise;

          const secondSearchResponsePromise = baseFacet.waitForSearchResponse();
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
        test.use({
          facetResponses: {
            responses: [allIdle, numericSelected, allIdle],
          },
        });
        test('should trigger a new search and log analytics', async ({
          breadcrumbManager,
          baseFacet,
        }) => {
          const [facetRangeStart, facetRangeEnd] =
            (await breadcrumbManager.firstNumericFacetValue)?.split(' - ') ??
            [];
          const searchResponsePromise = baseFacet.waitForSearchResponse();
          await breadcrumbManager.clickFirstNumericFacetLink();
          await searchResponsePromise;

          const secondSearchResponsePromise = baseFacet.waitForSearchResponse();
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

      test.describe('with timeframe|date facet values', () => {
        test.use({
          facetResponses: {
            responses: [allIdle, timeframeSelected, allIdle],
          },
        });
        test('should trigger a new search and log analytics', async ({
          breadcrumbManager,
          baseFacet,
        }) => {
          const facetValue = await breadcrumbManager.firstTimeframeFacetValue;
          test.expect(facetValue).not.toBeNull();
          const searchResponsePromise = baseFacet.waitForSearchResponse();
          await breadcrumbManager.clickFirstTimeframeFacetLink();
          await searchResponsePromise;

          const secondSearchResponsePromise = baseFacet.waitForSearchResponse();
          // We use the facet display value to compare, but the display value is prettified and is transformed to be human readable, while the analytics request isn't.
          const [expectedFacetRangeStart, expectedFacetRangeEnd] =
            datetimeFacetLabelToValue[facetValue!].split('..');
          const breadcrumbAnalyticsPromise =
            breadcrumbManager.waitForBreadcrumbFacetUaAnalytics({
              facetRangeStart: expectedFacetRangeStart,
              facetRangeEnd: expectedFacetRangeEnd,
            });
          await breadcrumbManager.clickFirstTimeframeFacetBreadcrumbValue();
          await secondSearchResponsePromise;
          await breadcrumbAnalyticsPromise;
        });
      });

      test.describe('with category facet values', () => {
        test.use({
          facetResponses: {
            responses: [allIdle, categorySelected, allIdle],
          },
        });
        test('should trigger a new search and log analytics', async ({
          breadcrumbManager,
          baseFacet,
        }) => {
          const facetValue = await breadcrumbManager.firstCategoryFacetValue;
          test.expect(facetValue).not.toBeNull();
          const searchResponsePromise = baseFacet.waitForSearchResponse();
          await breadcrumbManager.clickFirstCategoryFacetLink();
          await searchResponsePromise;

          const secondSearchResponsePromise = baseFacet.waitForSearchResponse();
          const expectedFacetValue = facetValue!;
          const breadcrumbAnalyticsPromise =
            breadcrumbManager.waitForBreadcrumbFacetUaAnalytics({
              categoryFacetPath: [expectedFacetValue],
            });
          await breadcrumbManager.clickFirstCategoryFacetBreadcrumbValue();
          await secondSearchResponsePromise;
          await breadcrumbAnalyticsPromise;
        });
      });
    });

    test.describe('when clicking on the clear all filters button', () => {
      test.use({
        facetResponses: {
          responses: [
            allIdle,
            regularSelected,
            regularAndTimeframeSelected,
            allIdle,
          ],
        },
      });
      test('should send a clear all filters analytics event and clear all selected facets values', async ({
        breadcrumbManager,
        baseFacet,
      }) => {
        const searchResponsePromise = baseFacet.waitForSearchResponse();
        await breadcrumbManager.clickFirstRegularFacetLink();
        await searchResponsePromise;

        const searchResponsePromiseTwo = baseFacet.waitForSearchResponse();
        await breadcrumbManager.clickFirstTimeframeFacetLink();
        await searchResponsePromiseTwo;

        await test.expect(breadcrumbManager.clearAllButton).toBeVisible();
        const clearAllSearchResponsePromise = baseFacet.waitForSearchResponse();
        const clearAllAnalyticsPromise =
          breadcrumbManager.waitForBreadcrumbResetAllUaAnalytics();
        await breadcrumbManager.clickClearAllButton();
        await clearAllAnalyticsPromise;
        const clearAllSearchResponse = await clearAllSearchResponsePromise;
        const {facets} = await clearAllSearchResponse.json();
        const activeFacets = facets.filter((facet: any) =>
          facet.values.some((value: any) => value.state !== 'idle')
        );
        test.expect(activeFacets).toHaveLength(0);
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when loading with a facet already selected', () => {
        const facetSelectedHash = 'f-filetype=YouTubeVideo';
        test.use({
          urlHash: facetSelectedHash,
          facetResponses: {
            responses: [regularSelected],
          },
        });

        test('should have a facet selected in the breadcrumb manager', async ({
          breadcrumbManager,
        }) => {
          test
            .expect(await breadcrumbManager.countAllFacetsBreadcrumb())
            .toBe(1);
        });
      });
    }
  });
});
