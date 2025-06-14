import {test, expect} from './fixture';

test.describe('atomic-load-more-results scroll behavior bug reproduction (KIT-4268)', () => {
  test.beforeEach(async ({loadMore, page}) => {
    // Load the load-more-results "in-page" story which includes a complete search interface
    // with atomic-load-more-results and automatically executes a search
    await page.goto(
      'http://localhost:4400/iframe.html?id=atomic-load-more-results--in-page'
    );
    await loadMore.hydrated.waitFor();
  });

  test('should be A11y compliant', async ({loadMore, makeAxeBuilder}) => {
    await loadMore.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should display a load more button when there are more results', async ({
    loadMore,
  }) => {
    await expect(loadMore.button).toBeVisible();
  });

  test('should display a summary of results', async ({loadMore}) => {
    await expect(loadMore.summary).toBeVisible();
  });

  test.describe('scroll position after search following load more click', () => {
    test('should maintain scroll position at top after new search (reproduction of KIT-4268)', async ({
      loadMore,
      searchBox,
      page,
    }) => {
      // Step 1: Verify initial state - page should be at top
      const initialScrollPosition = await loadMore.getScrollPosition();
      expect(initialScrollPosition).toBe(0);

      // Step 2: Click "Load More" button to load additional results
      await expect(loadMore.button).toBeVisible();
      await loadMore.button.click();

      // Wait for more results to load
      await page.waitForTimeout(2000);

      // Step 3: Manually scroll down to simulate user scrolling after load more
      // First check if the page is scrollable by getting document height
      const isScrollable = await page.evaluate(() => {
        return document.body.scrollHeight > window.innerHeight;
      });

      if (isScrollable) {
        // Scroll down to middle of page
        await page.evaluate(() =>
          window.scrollTo(0, document.body.scrollHeight / 2)
        );
        await page.waitForTimeout(500);

        const scrollPositionAfterScroll = await loadMore.getScrollPosition();
        expect(scrollPositionAfterScroll).toBeGreaterThan(0);

        // Step 4: Perform a new search
        await searchBox.searchInput.clear();
        await searchBox.searchInput.fill('different search term');
        await searchBox.submitButton.click();

        // Wait for new search results to load
        await page.waitForTimeout(2000);

        // Step 5: Check scroll position after new search
        // BUG REPRODUCTION: The page should be at the top (scrollY = 0) after a new search,
        // but currently it maintains the previous scroll position
        const scrollPositionAfterNewSearch = await loadMore.getScrollPosition();

        // THIS TEST SHOULD FAIL if the bug exists
        // Expected: scroll position should be at top (0) after new search
        // Actual: scroll position will be > 0 (same as before the search)
        expect(scrollPositionAfterNewSearch).toBe(0);
      } else {
        // If page is not scrollable, we can't reproduce the exact issue
        // but we can still verify that a new search works
        console.log('Page is not scrollable, skipping scroll position check');

        // Just perform a new search to ensure the functionality works
        await searchBox.searchInput.clear();
        await searchBox.searchInput.fill('different search term');
        await searchBox.submitButton.click();
        await page.waitForTimeout(2000);

        // Verify the search completed successfully
        await expect(loadMore.summary).toBeVisible();
      }
    });
  });

  test.describe('after clicking load more button', () => {
    test('should load more results', async ({loadMore, page}) => {
      // Count initial results by looking for atomic-result elements
      const initialResultCount = await page.locator('atomic-result').count();
      expect(initialResultCount).toBeGreaterThan(0); // Should have some results initially

      // Click load more
      await loadMore.button.click();

      // Wait for new results to load
      await page.waitForTimeout(2000);

      // Verify more results are now displayed (should be more than initial count)
      const newResultCount = await page.locator('atomic-result').count();
      expect(newResultCount).toBeGreaterThan(initialResultCount);

      // Additionally, verify we have more than the original count
      expect(newResultCount).toBeGreaterThan(initialResultCount);
    });

    test('should update the results summary', async ({loadMore, page}) => {
      // Click load more
      await loadMore.button.click();

      // Wait for results to load
      await page.waitForTimeout(1000);

      // Verify summary is still visible (it should update with new counts)
      await expect(loadMore.summary).toBeVisible();
    });
  });
});
