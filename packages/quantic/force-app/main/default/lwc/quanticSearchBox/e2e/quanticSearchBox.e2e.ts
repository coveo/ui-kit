import {testSearch, testInsight} from './fixture';
import {
  AnalyticsModeEnum,
  analyticsModeTest,
} from '../../../../../../playwright/utils/analyticsMode';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

const variants = [
  {
    variantName: 'default',
    textarea: false,
  },
  {
    variantName: 'expandable',
    textarea: true,
  },
];

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic search box ${useCase.label}`, () => {
    test.describe('analytics-related tests', () => {
      analyticsModeTest.forEach((analytics) => {
        test.describe(analytics.label, () => {
          test.use({
            analyticsMode: analytics.mode,
          });
          test('should send a search request and corresponding analytics after triggering a search', async ({
            searchBox,
            search,
          }) => {
            const testQuery = 'test';
            const expectedOriginContext =
              useCase.value === 'insight' ? 'InsightPanel' : 'Search';
            const searchBoxInput = searchBox.searchBoxInput;
            const searchRequestPromise = search.waitForSearchRequest();

            await searchBoxInput.fill(testQuery);
            await searchBoxInput.press('Enter');

            if (analytics.mode === AnalyticsModeEnum.legacy) {
              const searchLegacyAnalyticsPromise =
                searchBox.waitForSearchLegacyAnalytics({
                  queryText: testQuery,
                  originContext: expectedOriginContext,
                });

              await searchRequestPromise;
              await searchLegacyAnalyticsPromise;
            } else {
              await searchRequestPromise;
              const searchRequestBody = (
                await searchRequestPromise
              ).postDataJSON();

              test.expect(searchRequestBody.q).toBe(testQuery);
              test
                .expect(searchRequestBody?.analytics?.actionCause)
                .toBe('searchboxSubmit');
              test
                .expect(searchRequestBody?.analytics?.originContext)
                .toBe(expectedOriginContext);
              test.expect(searchRequestBody?.analytics?.capture).toBe(true);
            }
          });
        });
      });
    });

    variants.forEach(({variantName, textarea}) => {
      test.describe(`with ${variantName} variant`, () => {
        test.describe(`when the textarea property is ${textarea}`, () => {
          test.use({
            options: {
              textarea: textarea,
            },
          });
          test(`should ${textarea ? '' : 'not'} expand the search box when a very long string value is typed`, async ({
            searchBox,
          }) => {
            const defaultSearchBoxInputHeight = 48;
            const longQuery =
              'super long queryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';

            const searchBoxInput =
              textarea === true
                ? searchBox.searchBoxTextArea
                : searchBox.searchBoxInput;
            await searchBoxInput.fill(longQuery);

            const searchBoxInputHeight = await searchBoxInput.evaluate(
              (el) => (el as HTMLElement).offsetHeight
            );

            if (textarea) {
              test.expect(searchBoxInput).toBeVisible();
              test
                .expect(searchBoxInput.getAttribute('aria-expanded'))
                .toBeTruthy();
              test
                .expect(searchBoxInputHeight)
                .toBeGreaterThan(defaultSearchBoxInputHeight);
            } else {
              test.expect(searchBoxInput).toBeVisible();
              test
                .expect(searchBoxInputHeight)
                .toBe(defaultSearchBoxInputHeight);
            }
          });
        });
      });
    });
  });
});
