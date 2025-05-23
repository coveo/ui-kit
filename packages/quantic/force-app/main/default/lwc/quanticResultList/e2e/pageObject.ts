import type {Locator, Page, Request} from '@playwright/test';
import {isUaClickEvent} from '../../../../../../playwright/utils/requests';

export class ResultListObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get resultList(): Locator {
    return this.page.locator('c-quantic-result-list');
  }

  get resultLinks(): Locator {
    return this.resultList.locator('c-quantic-result-link a');
  }

  getResultLink(index: number): Locator {
    return this.resultLinks.nth(index);
  }

  async preventNavigationFromResultLink(index: number): Promise<void> {
    return this.getResultLink(index).evaluate((el) => {
      el?.addEventListener?.('click', (event) => {
        event.preventDefault();
      });
    });
  }

  async clickResultLink(index: number): Promise<void> {
    await this.resultLinks.nth(index).click();
  }

  async captureClickEventWorkaround(): Promise<void> {
    // Hack(?) to have the request payload in the analytics click event.
    // Without this the payload is not available in the request.
    return this.page.route('*analytics*', (route) => {
      route.continue();
    });
  }

  async waitForResultLinkClickUaAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForClickUaAnalytics(
      'documentOpen',
      (data: Record<string, any>) => {
        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => data?.[key] === expectedFields[key]
        );
        return matchesExpectedFields;
      }
    );
  }

  async waitForClickUaAnalytics(
    actionCause: string,
    fieldsMatcher?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const requestData = JSON.parse(requestBody.clickEvent);

        const expectedFields: Record<string, any> = {
          actionCause,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestData?.[key] === expectedFields[key]
        );

        return (
          matchesExpectedFields &&
          (fieldsMatcher ? fieldsMatcher(requestData, requestData) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }
}
