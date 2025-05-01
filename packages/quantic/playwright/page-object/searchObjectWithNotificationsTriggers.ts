import {Page} from '@playwright/test';
import {SearchObject} from './searchObject';

export class SearchObjectWithNotifyTrigger extends SearchObject {
  constructor(page: Page, searchRequestRegex: RegExp) {
    super(page, searchRequestRegex);
  }

  async mockSearchWithNotifyTriggerResponse(notifications: string[]) {
    await this.page.route(this.searchRequestRegex, async (route) => {
      const apiResponse = await this.page.request.fetch(route.request());
      const originalBody = await apiResponse.json();
      originalBody.triggers = notifications?.map((notification) => {
        return {
          type: 'notify',
          content: notification,
        };
      });

      await route.fulfill({
        body: JSON.stringify(originalBody),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
      this.page.unroute(this.searchRequestRegex);
    });
  }
}
