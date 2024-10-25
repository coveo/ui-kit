import {Page} from '@playwright/test';
import {getSearchRequestRegex} from '../utils/requests';
import {UseCase} from '../utils/use-case';

export class SearchObject {
  constructor(
    private page: Page,
    private useCase: UseCase = 'search'
  ) {}

  get performSearchButton() {
    return this.page.locator('c-action-perform-search button');
  }

  async performSearch() {
    await this.performSearchButton.click();
  }

  async waitForSearchResponse() {
    const searchRequestRegex = getSearchRequestRegex(this.useCase);
    return await this.page.waitForResponse(searchRequestRegex);
  }

  async interceptSearchAndLimitResultPages(
    numberOfPages: number,
    resultsPerPage = 10
  ) {
    const searchRequestRegex = getSearchRequestRegex(this.useCase);
    await this.page.route(searchRequestRegex, async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...json,
          totalCount: numberOfPages * resultsPerPage,
          totalCountFiltered: numberOfPages * resultsPerPage,
        }),
      });
    });
  }

  async interceptSearchIndefinitely(): Promise<() => void> {
    const searchRequestRegex = getSearchRequestRegex(this.useCase);
    return new Promise((resolve) => {
      this.page.route(searchRequestRegex, async (route) => {
        resolve(() => route.continue());
      });
    });
  }
}
