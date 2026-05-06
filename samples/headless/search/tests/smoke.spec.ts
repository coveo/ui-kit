import {expect, test} from '@playwright/test';

test.describe('Headless Search Sample', () => {
  test('loads and displays search results', async ({page}) => {
    await page.goto('http://localhost:3002');

    // Wait for results to load
    const querySummary = page.locator('#query-summary');
    await expect(querySummary).not.toBeEmpty();

    // Verify results appear
    const results = page.locator('.result-item');
    await expect(results.first()).toBeVisible();

    // Perform a search
    const searchInput = page.locator('#search-box input');
    await searchInput.fill('test');
    await searchInput.press('Enter');

    // Wait for results to update
    await expect(querySummary).toContainText('for "test"');
    await expect(results.first()).toBeVisible();

    // Verify facets are rendered
    const facets = page.locator('.facet');
    await expect(facets.first()).toBeVisible();

    // Verify pager is rendered
    const pager = page.locator('#pager button');
    await expect(pager.first()).toBeVisible();
  });
});
