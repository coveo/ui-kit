import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';
import {testSearch, testInsight, expect} from './fixture';

const fixtures = {
  search: testSearch as typeof testSearch,
  insight: testInsight as typeof testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];
  test.describe(`quantic-summary ${useCase.label}`, () => {
    test('should not render before results have returned', async ({
      summary,
      configuration,
    }) => {
      await configuration.reset();
      await configuration.configure({useCase: useCase.value});

      await expect(summary.summary).not.toBeVisible();
    });

    test.describe('when loading default summary', () => {
      test('should work as expected and display the summary', async ({
        search,
        summary,
      }) => {
        const defaultNumberOfResults = 10;
        const searchResponsePromise = search.waitForSearchResponse();
        await search.performSearch();
        const searchResponse = await searchResponsePromise;
        const totalCount = (await searchResponse.json()).totalCount;

        await expect(summary.summaryQuery).not.toBeVisible();
        await expect(summary.summaryRange).toBeVisible();
        await expect(await summary.getRange()).toBe(
          `1-${defaultNumberOfResults}`
        );
        await expect(summary.summaryTotal).toBeVisible();
        await expect(await summary.getTotal()).toBe(
          Intl.NumberFormat().format(totalCount)
        );
      });
    });

    test.describe('when a query yields no results', () => {
      test('should not render anything', async ({search, summary}) => {
        await search.mockEmptySearchResponse();
        await search.performSearch();
        await search.waitForSearchResponse();

        await expect(summary.summary).not.toBeVisible();
      });
    });

    test.describe('when selecting result per page', () => {
      test('should display the correct per-page number', async ({
        search,
        summary,
      }) => {
        const customResultsPerPage = 45;
        const searchResponsePromise = search.waitForSearchResponse();
        await summary.setResultsPerPage(customResultsPerPage);
        const searchResponse = await searchResponsePromise;

        const totalCount = (await searchResponse.json()).totalCount;

        await expect(summary.summaryQuery).not.toBeVisible();
        await expect(summary.summaryRange).toBeVisible();
        await expect(await summary.getRange()).toBe(
          `1-${customResultsPerPage}`
        );
        await expect(summary.summaryTotal).toBeVisible();
        await expect(await summary.getTotal()).toBe(
          Intl.NumberFormat().format(totalCount)
        );
      });
    });

    test.describe('when selecting next page', () => {
      test('should update the summary', async ({search, summary}) => {
        const defaultNumberOfResults = 10;
        await summary.goToNextPage();

        const searchResponse = await search.waitForSearchResponse();
        const totalCount = (await searchResponse.json()).totalCount;

        await expect(summary.summaryQuery).not.toBeVisible();
        await expect(summary.summaryRange).toBeVisible();
        await expect(await summary.getRange()).toBe(
          `${defaultNumberOfResults + 1}-${defaultNumberOfResults * 2}`
        );
        await expect(summary.summaryTotal).toBeVisible();
        await expect(await summary.getTotal()).toBe(
          Intl.NumberFormat().format(totalCount)
        );
      });
    });

    if (useCase.value === 'search') {
      test.describe('when a query is entered', () => {
        const query = 'test';
        test.use({
          urlHash: 'q=' + query,
        });

        test('should display the query in the summary', async ({summary}) => {
          await expect(summary.summaryRange).toBeVisible();
          await expect(summary.summaryTotal).toBeVisible();
          await expect(summary.summaryQuery).toBeVisible();
          await expect(await summary.getQuery()).toBe(query);
        });
      });

      test.describe('when a query yields one result', () => {
        const query =
          'Dogs spooked as earthquake shakes homes near San Diego. #SanDiego #BBCNews';
        test.use({
          urlHash: 'q=' + query,
        });

        test('should display the query in the summary', async ({summary}) => {
          await expect(summary.summaryQuery).toBeVisible();
          await expect(await summary.getQuery()).toBe(query);
          await expect(summary.summaryRange).toBeVisible();
          await expect(await summary.getRange()).toBe('1-1');
          await expect(summary.summaryTotal).toBeVisible();
          await expect(await summary.getTotal()).toBe('1');
        });
      });
    }
  });
});
