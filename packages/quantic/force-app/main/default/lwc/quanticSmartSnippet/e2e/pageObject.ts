import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaSearchEvent,
  isUaClickEvent,
} from '../../../../../../playwright/utils/requests';

export class SmartSnippetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get smartSnippet(): Locator {
    return this.page.locator('c-quantic-smart-snippet');
  }

  get smartSnippetSourceTitle(): Locator {
    return this.page.getByTestId('smart-snippet__source-title');
  }

  async waitForSmartSnippetSearchUaAnalytics(
    actionCause: any
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaSearchEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventValue: actionCause,
        };
        return Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForSmartSnippetClickUaAnalytics(
    actionCause: any
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventValue: actionCause,
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
