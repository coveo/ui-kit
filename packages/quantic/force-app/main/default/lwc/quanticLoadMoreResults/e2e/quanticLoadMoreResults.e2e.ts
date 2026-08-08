import {testSearch, testInsight} from './fixture';
import {
  useCaseEnum,
  useCaseTestCases,
} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic load more results ${useCase.label}`, () => {
    test('should load as expected', async ({loadMoreResults}) => {
      await test.expect(loadMoreResults.component).toBeVisible();
      await test.expect(loadMoreResults.summary).toBeVisible();
      await test.expect(loadMoreResults.progressBar).toBeVisible();
      await test.expect(loadMoreResults.loadMoreButton).toBeVisible();
    });

    test.describe('when clicking the load more button', () => {
      test('should append results and hide the button once all results are loaded', async ({
        loadMoreResults,
        search,
      }) => {
        const initialResultsCount = await loadMoreResults.results.count();

        const searchResponsePromise = search.waitForSearchResponse();
        await loadMoreResults.clickLoadMoreButton();
        await searchResponsePromise;

        await test
          .expect(loadMoreResults.results)
          .toHaveCount(initialResultsCount * 2);
        await test.expect(loadMoreResults.loadMoreButton).toBeHidden();
      });

      test('should announce that all results have been loaded', async ({
        loadMoreResults,
        page,
        search,
      }) => {
        const ariaLiveRegion = page.locator('[aria-live]');

        const searchResponsePromise = search.waitForSearchResponse();
        await loadMoreResults.clickLoadMoreButton();
        await searchResponsePromise;

        await test
          .expect(ariaLiveRegion)
          .toContainText('All results have been loaded');
      });
    });

    if (useCase.value === useCaseEnum.search) {
      test.describe('when there are no results', () => {
        test.beforeEach(async ({search}) => {
          await search.mockEmptySearchResponse();
        });

        test('should not render anything', async ({page}) => {
          const component = page.locator('c-quantic-load-more-results');
          await test.expect(component).toBeEmpty();
        });
      });
    }
  });
});
