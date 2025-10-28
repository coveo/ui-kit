/**
 * 🧪 End-to-End Search Tests
 *
 * Comprehensive tests for the SSR search interface, covering both
 * server-side rendering and client-side hydration scenarios.
 */
import {expect, test} from '@playwright/test';
import {createSearchPage} from './search.page.js';

test.describe('Coveo Headless SSR Search Sample', () => {
  test('should load and render the search interface with initial content', async ({
    page,
  }) => {
    const search = createSearchPage(page);
    await search.goto();

    await expect(page).toHaveTitle(/SSR Search/);

    await expect(search.searchInput).toBeVisible();
    await expect(search.searchButton).toBeVisible();
    await expect(search.resultContainer).toBeVisible();
    await expect(search.searchSummary).toBeVisible();

    const resultCount = await search.getResultCount();
    expect(resultCount).toBeGreaterThan(0);

    const summaryText = await search.getSearchSummary();
    expect(summaryText).toMatch(/\d+ results found/);
  });

  test('should perform interactive search and update URL', async ({page}) => {
    const search = createSearchPage(page);
    await search.goto();

    const initialSummary = await search.getSearchSummary();

    await search.searchFor('technology');

    await expect(page).toHaveURL(/\?q=technology/);

    const searchValue = await search.getSearchValue();
    expect(searchValue).toBe('technology');

    const newSummary = await search.getSearchSummary();
    expect(newSummary).not.toBe(initialSummary);
    expect(newSummary).toContain('technology');

    const newResultCount = await search.getResultCount();
    expect(newResultCount).toBeGreaterThan(0);
  });

  test('should handle empty search gracefully', async ({page}) => {
    const search = createSearchPage(page);
    await search.goto();

    await search.searchFor('');

    expect(page.url()).not.toContain('?q=');

    const summaryText = await search.getSearchSummary();
    expect(summaryText).toMatch(/\d+ results found/);
  });

  test('should maintain search state during navigation', async ({page}) => {
    const search = createSearchPage(page);

    await page.goto('/?q=science');

    const searchValue = await search.getSearchValue();
    expect(searchValue).toBe('science');

    const summaryText = await search.getSearchSummary();
    expect(summaryText).toContain('science');

    const resultCount = await search.getResultCount();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('should handle special characters in search queries', async ({page}) => {
    const search = createSearchPage(page);
    await search.goto();

    const specialQuery = 'test & special "characters"';
    await search.searchFor(specialQuery);

    expect(page.url()).toContain('?q=');

    const searchValue = await search.getSearchValue();
    expect(searchValue).toBe(specialQuery);
  });
});
