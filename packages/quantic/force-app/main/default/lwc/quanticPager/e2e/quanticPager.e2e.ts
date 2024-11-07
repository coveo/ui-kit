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
        await pager.clickNextPageButton();
        const response = await search.waitForSearchResponse();
        const {firstResult} = await response.request().postDataJSON();
        expect(firstResult).toBe(numberOfResultsPerPage);
        await pager.waitForPagerNextUaAnalytics();
      });
    });

    test.describe('when clicking the previous page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        await pager.clickNextPageButton();
        await search.waitForSearchResponse();

        await pager.clickPreviousPageButton();
        const response = await search.waitForSearchResponse();
        const {firstResult} = await response.request().postDataJSON();
        expect(firstResult).toBe(0);
        await pager.waitForPagerPreviousUaAnalytics();
      });
    });

    test.describe('when clicking a specific page button', () => {
      test('should trigger a new search and log analytics', async ({
        pager,
        search,
      }) => {
        const examplePage = 3;
        await pager.clickPageNumberButton(examplePage);
        const response = await search.waitForSearchResponse();
        const {firstResult} = await response.request().postDataJSON();
        expect(firstResult).toBe(numberOfResultsPerPage * (examplePage - 1));
        await pager.waitForPagerNumberUaAnalytics();
      });
    });

    test.describe('when a new search is made', () => {
      test('should select the first page', async ({pager, search}) => {
        await pager.clickNextPageButton();
        await search.waitForSearchResponse();

        await expect(pager.previousPageButton).not.toBeDisabled();
        await search.performSearch();
        const searchResponse = await search.waitForSearchResponse();
        const {firstResult} = await searchResponse.request().postDataJSON();

        const expectedPage = 0;
        await expect(pager.pageButtons.nth(expectedPage)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
        expect(firstResult).toBe(0);
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
