import type {Locator, Page, Request} from '@playwright/test';
import {isUaClickEvent} from '../../../../../../playwright/utils/requests';

export class RecommendationListObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get recommendationList(): Locator {
    return this.page.locator('c-quantic-recommendation-list');
  }

  get recommendationLinks(): Locator {
    return this.page.locator('c-quantic-result-link a');
  }

  getRecommendationLinkByIndex(index: number): Locator {
    return this.recommendationLinks.nth(index);
  }

  async captureRecommendationListClickEventWorkaround(): Promise<void> {
    // Hack(?) to have the request payload in the analytics click event.
    // Without this the payload is not available in the request.
    return this.page.route('*analytics*', (route) => {
      route.continue();
    });
  }

  async waitForRecommendationListClickEvent(
    actionCause: string,
    customChecker?: Function
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

        const customData = requestData?.customData;

        return (
          matchesExpectedFields &&
          (customChecker
            ? customChecker(requestData.customData, customData)
            : true)
        );
      }
      return false;
    });
    return uaRequest;
  }
}
