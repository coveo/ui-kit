// home.page.ts
import {Page} from '@playwright/test';

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async searchBox() {
    return this.page.getByPlaceholder('search');
  }

  async getSearchButton() {
    return this.page.getByRole('button', {name: 'Search', exact: true});
  }

  async getFacetsSection() {
    return this.page.getByLabel('Brand');
  }

  async getSuggestionsContainer() {
    return this.page.getByText('Suggestions :');
  }

  async getSuggestions() {
    return this.page.getByText('Suggestions :').locator('li >> button');
  }

  async getFirstFacet() {
    return this.page.getByLabel(/(Select|Deselect) facet value.*/).first();
  }

  async getFacetLoading() {
    return this.page.locator('.FacetLoading').first();
  }

  async getProductList() {
    return this.page.getByLabel('Product List');
  }

  async getProductItems() {
    const productList = await this.getProductList();
    return productList.getByRole('listitem').all();
  }

  async getFacetByLabel(label: string) {
    return this.page.getByLabel(label);
  }

  async getResultSummary() {
    return this.page.getByText(/Showing results \d+ - \d+ of/);
  }
}
