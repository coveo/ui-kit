import type {Locator, Page, Request, Response} from '@playwright/test';
import {isUaCustomEvent} from '../../../../../../playwright/utils/requests';

const userActionsRequestRegex =
  /\/rest\/organizations\/.*\/machinelearning\/user\/actions$/;

export class UserActionsToggleObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get userActionsToggleButton(): Locator {
    return this.page.getByRole('button', {name: /User actions/i});
  }

  get userActionsModal(): Locator {
    return this.page.locator(
      'c-quantic-user-actions-toggle > c-quantic-modal > div'
    );
  }

  get userActionsModalCloseButton(): Locator {
    return this.page
      .locator('c-quantic-user-actions-toggle > c-quantic-modal')
      .getByRole('button', {name: 'Close'});
  }

  async mockUserActions(
    userActions: Array<{name: string; value: string; time: number}>
  ) {
    await this.page.route(userActionsRequestRegex, async (route) => {
      const body = {value: userActions};

      await route.fulfill({
        body: JSON.stringify(body),
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
    });
  }

  async waitForUserActionsResponse(userId: string): Promise<Response> {
    return this.page.waitForResponse((response) => {
      const request = response.request();
      if (request.url().match(userActionsRequestRegex)) {
        const requestBody = request.postDataJSON?.();
        return requestBody?.objectId === userId;
      }
      return false;
    });
  }

  async waitForOpenUserActionsUaAnalytics(): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventType: 'User Actions',
          eventValue: 'openUserActions',
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
