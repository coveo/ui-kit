import {test, expect} from './fixture';

test.describe('default', () => {
  test.beforeEach(async ({page}) => {
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-load-more--default&viewMode=story&args=suggestion-timeout:5000'
    );
  });

  // assertAccessibility
  // assertContainsComponentError
  test('should display a recap of the amount of results', async ({
    loadMore,
  }) => {
    await loadMore.loadMoreButton.waitFor({state: 'visible'});
    await expect(loadMore.summary()).toBeVisible();
  });

  test('should display a progress bar', async ({loadMore}) => {
    expect(loadMore.progressBar).toBeVisible();
    expect(loadMore.progressValue).toHaveCSS(
      'width',
      /^(100|[1-9]|[1-9][0-9])%$/
    );
  });

  test('should display a load more button', async ({loadMore}) => {
    expect(loadMore.loadMoreButton).toBeVisible();
  });

  test.describe('after clicking the load more button', () => {
    // test.beforeEach(async ({searchBox}) => {
    //   await searchBox
    //     .searchSuggestions()
    //     .first()
    //     .waitFor({state: 'visible', timeout: 10e3});
    //   await searchBox.submitButton.click();
    // });

    // LoadMoreResultsSelectors.resultsRecap().then((recap) => {
    //   const totalMatch = recap.text().match(/\bshowing ([0-9]+) of/i);
    //   const total = totalMatch ? parseInt(totalMatch[1]) : 0;
    //   const newTotal = total + 10;
    //   LoadMoreResultsSelectors.button().click();
    //   LoadMoreResultsSelectors.resultsRecap().should(
    //     'include.text',
    //     `Showing ${newTotal} of`
    //   );
    // });

    // await loadMore.loadMoreButton.waitFor({state: 'visible'});
    // await loadMore.loadMoreButton.click();
    // await page.waitForTimeout(1000); // Wait for products to load

    test('should load more prodcuts', async ({loadMore}) => {
      await expect(loadMore.summary({total: 10000})).toBeVisible(); // TODO: 10 de plus
    });

    // TODO: test: should include analytics in the v2 call ??
  });
});

// test('should load more products when clicking the load more button', async ({
//   loadMore,
//   page,
// }) => {
//   await loadMore.loadMoreButton.waitFor({state: 'visible'});
//   await loadMore.loadMoreButton.click();
//   await page.waitForTimeout(1000); // Wait for products to load
//   await expect(loadMore.summary({total: 2})).toBeVisible();
// });

// test('should display an error message if loading more products fails', async ({
//   loadMore,
//   page,
// }) => {
//   await loadMore.loadMoreButton.waitFor({state: 'visible'});
//   await loadMore.loadMoreButton.click();
//   await page.waitForTimeout(1000); // Wait for products to load
//   await expect(loadMore.errorMessage).toBeVisible();
// });
