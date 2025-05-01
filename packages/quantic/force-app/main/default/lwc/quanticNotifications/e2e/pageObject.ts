import type {Locator, Page, Request} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

export class NotificationsObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get setQueryInput(): Locator {
    return this.page.locator('c-action-perform-search input');
  }

  get performSearchButton(): Locator {
    return this.page.locator('c-action-perform-search button');
  }

  async setQuery(query: string): Promise<void> {
    await this.setQueryInput.fill(query);
  }

  async performSearch(): Promise<void> {
    await this.performSearchButton.click();
  }

  get notifications(): Promise<Array<Locator>> {
    return this.page.getByTestId('notification').all();
  }

  getNotification(index: number): Locator {
    return this.page.getByTestId('notification').nth(index);
  }

  async waitForNotifyTriggerCustomAnalytics(
    expectedNotifications?: string[]
  ): Promise<Request> {
    return this.waitForCustomUARequest(
      'queryPipelineTriggers',
      'notify',
      expectedNotifications
    );
  }

  async waitForCustomUARequest(
    eventType: string,
    eventValue: string,
    expectedNotifications?: string[]
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const {customData} = requestBody;
        const expectedFields: Record<string, any> = {
          eventType,
          eventValue,
        };
        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );
        const matchesNotifications = Array.isArray(expectedNotifications)
          ? expectedNotifications.every((notification) =>
              customData?.notifications?.includes(notification)
            )
          : true;

        return matchesExpectedFields && matchesNotifications;
      }
      return false;
    });
    return uaRequest;
  }
}
