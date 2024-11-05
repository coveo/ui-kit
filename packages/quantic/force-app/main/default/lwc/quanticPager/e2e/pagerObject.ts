import {Page} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class PagerObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get nextPageButton() {
    return this.page.locator('button[title="Next Page"]');
  }

  get previousPageButton() {
    return this.page.locator('button[title="Previous Page"]');
  }

  get pageButtons() {
    return this.page.locator('c-quantic-number-button button');
  }

  pageButton(pageNumber: number) {
    return this.pageButtons.nth(pageNumber - 1);
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

  async waitForPagerNextUaAnalytics() {
    const uaRequest = await this.waitForPagerUaAnalytics('pagerNext');
    return uaRequest;
  }

  async waitForPagerPreviousUaAnalytics() {
    const uaRequest = await this.waitForPagerUaAnalytics('pagerPrevious');
    return uaRequest;
  }

  async waitForPagerNumberUaAnalytics() {
    const uaRequest = await this.waitForPagerUaAnalytics('pagerNumber');
    return uaRequest;
  }
}
