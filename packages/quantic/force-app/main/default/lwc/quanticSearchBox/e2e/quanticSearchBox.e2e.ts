import {testSearch, testInsight, expect} from './fixture';
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
    analyticsModeTest.forEach((analytics) => {
      test.describe(`${analytics.label} related tests`, () => {
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

            expect(searchRequestBody).toEqual(
              expect.objectContaining({
                q: testQuery,
                analytics: expect.objectContaining({
                  actionCause: 'searchboxSubmit',
                  originContext: expectedOriginContext,
                  capture: true,
                }),
              })
            );
          }
        });
      });
    });

    test.describe(`with ${defaultVariant.variantName} variant`, () => {
      test('should not expand the search box height when a very long query is typed', async ({
        searchBox,
      }) => {
        const searchBoxInput = searchBox.searchBoxInput;
        await searchBoxInput.fill(longQuery);

        const searchBoxInputHeight = await searchBoxInput.evaluate(
          (el) => (el as HTMLElement).offsetHeight
        );
        expect(searchBoxInput).toBeVisible();
        expect(searchBoxInputHeight).toBe(defaultSearchBoxInputHeight);
        const whiteSpace = await searchBoxInput.evaluate(
          (el) => window.getComputedStyle(el).whiteSpace
        );
        const overflow = await searchBoxInput.evaluate(
          (el) => window.getComputedStyle(el).overflow
        );

        expect(whiteSpace).toBe('normal');
        expect(overflow).toBe('clip');
      });
    });

    test.describe(`with ${expandableVariant.variantName} variant`, () => {
      test.use({
        options: {
          textarea: expandableVariant.textarea,
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
        expect(searchBoxTextarea).toBeVisible();
        expect(searchBoxTextareaHeight).toBeGreaterThan(
          defaultSearchBoxInputHeight
        );
        const whiteSpace = await searchBoxTextarea.evaluate(
          (el) => window.getComputedStyle(el).whiteSpace
        );
        const overflow = await searchBoxTextarea.evaluate(
          (el) => window.getComputedStyle(el).overflow
        );

        expect(whiteSpace).toBe('pre-wrap');
        expect(overflow).toBe('auto');
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
        expect(searchBoxTextarea).toBeVisible();
        console.log(
          'aria-expanded',
          searchBoxTextarea.getAttribute('aria-expanded')
        );
        expect(await searchBoxTextarea.getAttribute('aria-expanded')).toBe(
          'false'
        );
        expect(collapsedSearchBoxTextareaHeight).toBe(
          defaultSearchBoxInputHeight
        );
      });
    });
  });
});
