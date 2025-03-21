import {Page} from '@playwright/test';
import {SearchObject} from './searchObject';

export class SearchObjectWithQuickview extends SearchObject {
  constructor(
    page: Page,
    searchRequestRegex: RegExp,
    private documentHtmlRequestRegex: RegExp
  ) {
    super(page, searchRequestRegex);
  }

  async waitForQuickviewResponse() {
    return this.page.waitForResponse(this.documentHtmlRequestRegex);
  }

  async mockQuickviewResponse(htmlContent: string) {
    await this.page.route(this.documentHtmlRequestRegex, async (route) => {
      await route.fulfill({
        body: htmlContent,
        status: 200,
        headers: {
          'content-type': 'text/html',
        },
      });
    });
  }
}
