import {test, expect} from '@playwright/test';

test.describe('smoke test', () => {
  test.use({viewport: {width: 2000, height: 2000}});

  test('should load', async ({page}) => {
    // Visit the application
    await page.goto('http://localhost:5173');

    // Check for the search box and perform a search
    const searchBox = page.locator('atomic-search-box');
    await expect(searchBox).toBeVisible();

    const textarea = searchBox.locator('textarea[part="textarea"]');
    await textarea.fill('test');
    await textarea.press('Enter');

    // Verify facet exists
    const facet = page.locator('atomic-facet').first();
    await expect(facet).toBeVisible();

    // Verify query summary
    const querySummary = page.locator('atomic-query-summary');
    await expect(querySummary).toBeVisible();

    const summaryContainer = querySummary.locator('div[part="container"]');
    await expect(summaryContainer).toHaveText(/Results 1-[1-9].*for test/);

    // Verify result list and results exist
    const resultList = page.locator('atomic-result-list');
    await expect(resultList).toBeVisible();

    const firstResult = resultList.locator('atomic-result').first();
    await expect(firstResult).toBeVisible();
  });
});
