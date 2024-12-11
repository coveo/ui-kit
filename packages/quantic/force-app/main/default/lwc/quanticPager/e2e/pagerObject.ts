import type {Locator, Page, Request} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class PagerObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get nextPageButton(): Locator {
    return this.page.getByRole('button', {name: /Next Page/i});
  }

  get previousPageButton(): Locator {
    return this.page.getByRole('button', {name: /Previous Page/i});
  }

  get pageButtons(): Locator {
    return this.page.locator('c-quantic-number-button button');
  }

  pageButton(pageNumber: number): Locator {
    return this.pageButtons.nth(pageNumber - 1);
  }

  async goToLastPage(): Promise<void> {
    await this.pageButtons.nth(-1).click();
  }

  async clickNextPageButton(): Promise<void> {
    await this.nextPageButton.click();
  }

  async clickPreviousPageButton(): Promise<void> {
    await this.previousPageButton.click();
  }

  async clickPageNumberButton(pageNumber: number): Promise<void> {
    await this.pageButtons.nth(pageNumber - 1).click();
  }

  async waitForPagerUaAnalytics(eventValue): Promise<Request> {
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

  async waitForPagerNextUaAnalytics(): Promise<Request> {
    return this.waitForPagerUaAnalytics('pagerNext');
  }

  async waitForPagerPreviousUaAnalytics(): Promise<Request> {
    return this.waitForPagerUaAnalytics('pagerPrevious');
  }

  async waitForPagerNumberUaAnalytics(): Promise<Request> {
    return this.waitForPagerUaAnalytics('pagerNumber');
  }
}
