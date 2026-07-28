import {Page} from '@playwright/test';
import * as searchResponses from '@coveo/platform-mock-api/search/search-response';
import {SearchObject} from './searchObject';

export class SearchObjectWithNotifyTrigger extends SearchObject {
  constructor(page: Page, searchRequestRegex: RegExp) {
    super(page, searchRequestRegex);
  }

  async mockSearchWithNotifyTriggerResponse(notifications: string[]) {
    await this.page.unroute(this.searchRequestRegex);
    await this.page.route(this.searchRequestRegex, async (route) => {
      const body = {
        ...searchResponses.richResponse,
        triggers: notifications?.map((notification) => ({
          type: 'notify',
          content: notification,
        })),
      };

      await route.fulfill({
        body: JSON.stringify(body),
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    });
  }
}
