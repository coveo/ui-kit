import {Page} from '@playwright/test';

export class SearchPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async searchBox() {
    return this.page.getByPlaceholder('search');
  }

  async getSearchButton() {
    return this.page.getByRole('button', {name: 'Search', exact: true});
  }

  async getSuggestionsContainer() {
    return this.page.getByText('Suggestions :');
  }

  async getSuggestions() {
    return this.page.getByText('Suggestions :').locator('li >> button');
  }

  async getProductList() {
    return this.page.getByLabel('Product List');
  }

  async getProductItems() {
    const productList = await this.getProductList();
    return productList.getByRole('listitem').all();
  }

  async getResultSummary() {
    return this.page.getByText(/Showing results \d+ - \d+ of/);
  }
}
