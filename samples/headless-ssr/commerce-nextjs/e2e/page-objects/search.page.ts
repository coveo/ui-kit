import type {Page} from '@playwright/test';

export class SearchPageObject {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get searchBox() {
    return this.page.getByPlaceholder('search');
  }

  get searchButton() {
    return this.page.getByRole('button', {name: 'Search', exact: true});
  }

  get suggestionsContainer() {
    return this.page.getByText('Suggestions :');
  }

  get suggestions() {
    return this.page.getByText('Suggestions :').locator('li >> button');
  }

  get productList() {
    return this.page.getByLabel('Product List');
  }

  get productItems() {
    const productList = this.productList;
    return productList.getByRole('listitem').all();
  }

  get resultSummary() {
    return this.page.getByText(/Showing results \d+ - \d+ of/);
  }
}
