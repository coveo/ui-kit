import type {Locator, Page, Request} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class SmartSnippetSuggestionsObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get smartSnippetSuggestions(): Locator {
    return this.page.locator('c-quantic-smart-snippet-suggestions');
  }

  async waitForSmartSnippetSuggestionsUaAnalytics(
    eventValue: any
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventType: 'getMoreResults', // TO CHANGE
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
