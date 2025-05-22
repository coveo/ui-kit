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

  get firstRecommendationLink(): Locator {
    return this.recommendationLinks.first();
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
