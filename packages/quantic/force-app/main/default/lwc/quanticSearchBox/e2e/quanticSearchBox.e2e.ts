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

const defaultVariant = {
  variantName: 'default',
  textarea: false,
};

const expandableVariant = {
  variantName: 'expandable',
  textarea: true,
};

const defaultSearchBoxInputHeight = 48;
const longQuery =
  'super long queryyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy';

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic search box ${useCase.label}`, () => {
    test.describe('analytics-related tests', () => {
      analyticsModeTest.forEach((analytics) => {
        test.describe(analytics.label, () => {
          test.use({
            analyticsMode: analytics.mode,
          });
          test('should send a search request and analytics after triggering a search', async ({
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

    test.describe(`with ${defaultVariant.variantName} variant`, () => {
      test('should not expand the search box height when a very long query is typed', async ({
        searchBox,
      }) => {
        const expectedAriaExpandedValue =
          useCase.value === 'insight' ? null : '0';
        const searchBoxInput = searchBox.searchBoxInput;
        await searchBoxInput.fill(longQuery);

        const searchBoxInputHeight = await searchBoxInput.evaluate(
          (el) => (el as HTMLElement).offsetHeight
        );
        test.expect(searchBoxInput).toBeVisible();
        test
          .expect(await searchBoxInput.getAttribute('aria-expanded'))
          .toBe(expectedAriaExpandedValue);
        test.expect(searchBoxInputHeight).toBe(defaultSearchBoxInputHeight);
      });
    });

    test.describe(`with ${expandableVariant.variantName} variant`, () => {
      test.use({
        options: {
          textarea: true,
        },
      });

      test('should expand the search box height when a very long query is typed', async ({
        searchBox,
      }) => {
        const searchBoxTextarea = searchBox.searchBoxTextArea;
        await searchBoxTextarea.fill(longQuery);

        const searchBoxTextareaHeight = await searchBoxTextarea.evaluate(
          (el) => (el as HTMLElement).offsetHeight
        );
        test.expect(searchBoxTextarea).toBeVisible();
        test
          .expect(searchBoxTextarea.getAttribute('aria-expanded'))
          .toBeTruthy();
        test
          .expect(searchBoxTextareaHeight)
          .toBeGreaterThan(defaultSearchBoxInputHeight);
      });

      test('should collapse back to default height when it is expanded and clicking outside of the search box', async ({
        searchBox,
      }) => {
        const searchBoxTextarea = searchBox.searchBoxTextArea;
        await searchBoxTextarea.fill(longQuery);

        await searchBox.focusOutsideSearchBox();

        const collapsedSearchBoxTextareaHeight =
          await searchBoxTextarea.evaluate(
            (el) => (el as HTMLElement).offsetHeight
          );
        test.expect(searchBoxTextarea).toBeVisible();
        console.log(
          'aria-expanded',
          searchBoxTextarea.getAttribute('aria-expanded')
        );
        test
          .expect(await searchBoxTextarea.getAttribute('aria-expanded'))
          .toBe('false');
        test
          .expect(collapsedSearchBoxTextareaHeight)
          .toBe(defaultSearchBoxInputHeight);
      });
    });
  });
});
