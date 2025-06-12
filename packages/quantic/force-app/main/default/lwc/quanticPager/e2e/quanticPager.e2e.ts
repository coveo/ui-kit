import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const numberOfResultsPerPage = 10;

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic pager ${useCase.label}`, () => {
    test.describe('when clicking the next page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        const searchResponsePromise = search.waitForSearchResponse();
        const pagerNextUaAnalyticsPromise = pager.waitForPagerNextUaAnalytics();
        await pager.clickNextPageButton();
        const searchResponse = await searchResponsePromise;
        const {firstResult} = searchResponse.request().postDataJSON();
        expect(firstResult).toBe(numberOfResultsPerPage);
        await pagerNextUaAnalyticsPromise;
      });
    });

    test.describe('when clicking the previous page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        const initialSearchResponsePromise = search.waitForSearchResponse();
        await pager.clickNextPageButton();
        await initialSearchResponsePromise;

        const searchResponsePromise = search.waitForSearchResponse();
        const pagerPreviousUaAnalyticsPromise =
          pager.waitForPagerPreviousUaAnalytics();
        await pager.clickPreviousPageButton();
        const searchResponse = await searchResponsePromise;
        const {firstResult} = searchResponse.request().postDataJSON();
        expect(firstResult).toBe(0);
        await pagerPreviousUaAnalyticsPromise;
      });
    });

    test.describe('when clicking a specific page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        const examplePage = 3;
        const searchResponsePromise = search.waitForSearchResponse();
        const pagerPageUaAnalyticsPromise =
          pager.waitForPagerNumberUaAnalytics();
        await pager.clickPageNumberButton(examplePage);
        const searchResponse = await searchResponsePromise;
        const {firstResult} = searchResponse.request().postDataJSON();
        expect(firstResult).toBe(numberOfResultsPerPage * (examplePage - 1));
        await pagerPageUaAnalyticsPromise;
      });
    });

    test.describe('when a new search is made', () => {
      test('should select the first page', async ({pager, search}) => {
        const initialSearchResponsePromise = search.waitForSearchResponse();
        await pager.clickNextPageButton();
        await initialSearchResponsePromise;

        await expect(pager.previousPageButton).not.toBeDisabled();
        const searchResponsePromise = search.waitForSearchResponse();
        await search.performSearch();
        const searchResponse = await searchResponsePromise;
        const {firstResult} = searchResponse.request().postDataJSON();

        const expectedPage = 0;
        await expect(pager.pageButtons.nth(expectedPage)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        expect(firstResult).toBe(expectedPage);
      });
    });

    if (useCase.value === 'search') {
      test.describe('when loading options from the url', () => {
        test.use({
          urlHash: 'firstResult=10',
        });

        test('should reflect the options of url in the component', async ({
          pager,
        }) => {
          const expectedPage = 2;
          await expect(pager.pageButton(expectedPage)).toHaveAttribute(
            'aria-pressed',
            'true'
          );
        });
      });
    }
  });
});
