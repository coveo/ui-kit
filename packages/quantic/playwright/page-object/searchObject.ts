import {Page, Locator, Response} from '@playwright/test';

export class SearchObject {
  constructor(
    private page: Page,
    private searchRequestRegex: RegExp
  ) {
    this.page = page;
    this.searchRequestRegex = searchRequestRegex;
  }

  get performSearchButton(): Locator {
    return this.page.locator('c-action-perform-search button');
  }

  async performSearch(): Promise<void> {
    await this.performSearchButton.click();
  }

  async waitForSearchResponse(): Promise<Response> {
    return this.page.waitForResponse(this.searchRequestRegex);
  }

  async interceptSearchIndefinitely(): Promise<() => void> {
    return new Promise((resolve) => {
      this.page.route(this.searchRequestRegex, async (route) => {
        resolve(() => route.continue());
      });
    });
  }
}
