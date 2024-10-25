import {Page} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class PagerObject {
  constructor(public page: Page) {}

  get nextPageButton() {
    return this.page.locator('button[title="Next Page"]');
  }

  get previousPageButton() {
    return this.page.locator('button[title="Previous Page"]');
  }

  get pageButtons() {
    return this.page.locator('c-quantic-number-button button');
  }

  async goToLastPage() {
    await this.pageButtons.nth(-1).click();
  }

  async clickNextPageButton() {
    await this.nextPageButton.click();
  }

  async clickPreviousPageButton() {
    await this.previousPageButton.click();
  }

  async clickPageNumberButton(pageNumber: number) {
    await this.pageButtons.nth(pageNumber - 1).click();
  }

  async waitForPagerUaAnalytics(eventValue) {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventType: 'getMoreResults',
          eventValue: eventValue,
        };
        return Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );
      }
      return false;
    });
    return uaRequest;
  }
}
