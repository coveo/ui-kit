import type {Locator, Page} from '@playwright/test';

export class DidYouMeanObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get setQueryInput(): Locator {
    return this.page.locator('c-action-perform-search input');
  }

  get performSearchButton(): Locator {
    return this.page.locator('c-action-perform-search button');
  }

  get didYouMeanNoResultsLabel(): Locator {
    return this.page.getByTestId('no-result-label');
  }

  async setQuery(query: string): Promise<void> {
    await this.setQueryInput.fill(query);
  }

  async performSearch(): Promise<void> {
    await this.performSearchButton.click();
  }
}
