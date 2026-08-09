import {testSearch, testInsight, expect} from './fixture';
import {useCaseTestCases} from '../../../../../../playwright/utils/useCase';

const fixtures = {
  search: testSearch,
  insight: testInsight,
};

useCaseTestCases.forEach((useCase) => {
  let test = fixtures[useCase.value];

  test.describe(`quantic load more results ${useCase.label}`, () => {
    test.describe('when more results are available', () => {
      test('should render the button, summary, and progress indicator', async ({
        loadMoreResults,
      }) => {
        await expect(loadMoreResults.summary).toBeVisible();
        await expect(loadMoreResults.progressBar).toBeVisible();
        await expect(loadMoreResults.loadMoreButton).toBeVisible();
      });

      test.describe('when clicking the load more button', () => {
        test('should append the next batch of results and update the summary', async ({
          loadMoreResults,
          search,
        }) => {
          const searchResponsePromise = search.waitForSearchRequest();
          await loadMoreResults.clickLoadMoreButton();
          const searchRequest = await searchResponsePromise;
          const {firstResult} = searchRequest.postDataJSON();

          expect(firstResult).toBeGreaterThan(0);
        });
      });
    });

    test.describe('when no results are available', () => {
      test.use({emptyResults: true});

      test('should render nothing', async ({loadMoreResults}) => {
        await expect(loadMoreResults.summary).toBeHidden();
        await expect(loadMoreResults.progressBar).toBeHidden();
        await expect(loadMoreResults.loadMoreButton).toBeHidden();
      });
    });
  });
});
