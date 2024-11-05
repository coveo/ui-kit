import {Page} from '@playwright/test';

export class SearchObject {
  constructor(
    private page: Page,
    private searchRequestRegex: RegExp
  ) {
    this.page = page;
    this.searchRequestRegex = searchRequestRegex;
  }

  get performSearchButton() {
    return this.page.locator('c-action-perform-search button');
  }

  async performSearch() {
    await this.performSearchButton.click();
  }

  async waitForSearchResponse() {
    return await this.page.waitForResponse(this.searchRequestRegex);
  }

  async interceptSearchIndefinitely(): Promise<() => void> {
    return new Promise((resolve) => {
      this.page.route(this.searchRequestRegex, async (route) => {
        resolve(() => route.continue());
      });
    });
  }
}
