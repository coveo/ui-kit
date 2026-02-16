import type {Page} from '@playwright/test';

export class InsightQuerySummaryPageObject {
  constructor(private page: Page) {}

  get querySummary() {
    return this.page.locator('atomic-insight-query-summary');
  }

  async load({story}: {story: string}) {
    await this.page.goto(
      `/iframe.html?id=atomic-insight-query-summary--${story}&viewMode=story`
    );
  }

  async hydrated() {
    return this.querySummary.waitFor({state: 'attached'});
  }
}
