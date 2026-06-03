import type {Page} from '@playwright/test';

export function createSearchPage(page: Page) {
  const searchInput = page.locator('#search-input');
  const searchButton = page.locator('#search-button');
  const productGrid = page.locator('#product-grid');
  const products = page.locator('.product-card');
  const searchSummary = page.locator('#query-summary');

  async function goto() {
    await page.goto('/');
  }

  async function searchFor(query: string) {
    await searchInput.clear();
    await searchInput.fill(query);
    await searchButton.click();

    await productGrid.waitFor({state: 'visible'});
    await products.first().waitFor({state: 'visible'});
  }

  return {
    page,
    searchInput,
    searchButton,
    productGrid,
    products,
    searchSummary,
    goto,
    searchFor,
  };
}
