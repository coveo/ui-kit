import type {Page} from '@playwright/test';

export function createSearchPage(page: Page) {
  const searchInput = page.locator('#search-input');
  const searchButton = page.locator('#search-button');
  const resultList = page.locator('#result-list');
  const results = page.locator('.result-card');
  const searchSummary = page.locator('#query-summary');

  async function goto() {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  }

  async function searchFor(query: string) {
    await searchInput.clear();
    await searchInput.fill(query);

    await searchButton.click();

    await resultList.waitFor({state: 'visible'});

    // Wait for at least one result or no-results message
    await page.waitForFunction(() => {
      const list = document.querySelector('#result-list');
      const noResults = document.querySelector('.no-results') as HTMLElement;
      return (
        (list && list.children.length > 0) ||
        (noResults && noResults.style.display !== 'none')
      );
    });

    // Wait for loading state to finish
    await page.waitForFunction(() => {
      const summary = document.querySelector('#query-summary');
      return summary && !summary.textContent?.includes('Loading...');
    });
  }

  async function getSearchSummary(): Promise<string> {
    return (await searchSummary.textContent()) || '';
  }

  async function getSearchValue(): Promise<string> {
    return await searchInput.inputValue();
  }

  async function getResultCount(): Promise<number> {
    return await results.count();
  }

  return {
    page,
    searchInput,
    searchButton,
    resultContainer: resultList,
    results,
    searchSummary,

    // Action methods
    goto,
    searchFor,

    // Query methods
    getSearchSummary,
    getSearchValue,
    getResultCount,
  };
}
