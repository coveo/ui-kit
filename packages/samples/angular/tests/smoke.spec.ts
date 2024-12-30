import {test, expect} from '@playwright/test';

test.describe('smoke test', () => {
  // Setting viewport size
  test.use({
    viewport: {width: 2000, height: 2000},
  });

  test('should load', async ({page}) => {
    // Visit the specified URL
    await page.goto('http://localhost:4200/atomic-angular');

    // Check if the search box exists and interact with it
    const searchBox = page.locator('atomic-search-box');
    await expect(searchBox).toBeVisible();
    const textArea = searchBox.locator('textarea[part="textarea"]');
    await textArea.fill('test');
    await textArea.press('Enter');

    // Check if the facet is visible
    const facet = page.locator('atomic-facet').first();
    await expect(facet).toBeVisible();

    // Check if the query summary contains the expected text
    const querySummary = page.locator(
      'atomic-query-summary div[part="container"]'
    );
    await expect(querySummary).toContainText(/^Results 1-[1-9]/);
    await expect(querySummary).toContainText('for test');

    // Check if the result list and results exist
    const resultList = page.locator('atomic-result-list');
    await expect(resultList).toBeVisible();
    const result = resultList.locator('atomic-result').first();
    await expect(result).toBeVisible();
  });
});
