import type {Page} from '@playwright/test';

export function createSearchPage(page: Page) {
  const searchInput = page.locator('#search-input');
  const searchButton = page.locator('#search-button');
  const resultList = page.locator('#result-list');
  const results = page.locator('.result-card');
  const querySummary = page.locator('#query-summary');

  async function goto() {
    await page.goto('/');
  }

  async function searchFor(query: string) {
    await searchInput.clear();
    await searchInput.fill(query);
    await searchButton.click();

    await resultList.waitFor({state: 'visible'});
    await results.first().waitFor({state: 'visible'});
  }

  return {
    page,
    searchInput,
    searchButton,
    resultList,
    results,
    querySummary,
    goto,
    searchFor,
  };
}
