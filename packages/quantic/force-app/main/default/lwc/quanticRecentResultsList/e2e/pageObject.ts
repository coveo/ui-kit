import type {Locator, Page, Request} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class RecentResultListObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get recentResultList(): Locator {
    return this.page.locator('c-quantic-recent-result-list');
  }

  get recentResultListItemLinks(): Locator {
    return this.page.locator('c-quantic-recent-result-link');
  }

  get selectResultButton(): Locator {
    return this.page.locator('c-action-select-results button');
  }

  async clickSelectResultButton(): Promise<void> {
    await this.selectResultButton.click();
  }

  getRecentResultLinkByIndex(index: number): Locator {
    return this.recentResultListItemLinks.nth(index);
  }

  async waitForRecentResultClickAnalytics(
    expectedFields: Record<string, any>
  ): Promise<Request> {
    return this.waitForRecentResultListSearchAnalytics(
      'recentlyClickedDocuments',
      'recentResultClick',
      expectedFields.documentTitle,
      expectedFields.documentUrl
    );
  }

  async waitForRecentResultListSearchAnalytics(
    eventType: string,
    eventValue: string,
    documentTitle?: string,
    documentUrl?: string
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields: Record<string, any> = {
          eventType,
          eventValue,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        const customData = requestBody?.customData;

        const matchesCustomData =
          customData?.info?.documentTitle === documentTitle &&
          customData?.info?.documentUrl === documentUrl;

        return matchesExpectedFields && matchesCustomData;
      }
      return false;
    });
    return uaRequest;
  }
}
