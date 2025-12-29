import type {Page} from '@playwright/test';

export class InsightQuerySummaryPageObject {
  constructor(private page: Page) {}

  get querySummary() {
    return this.page.locator('atomic-insight-query-summary');
  }

  get container() {
    return this.querySummary.locator('[part="container"]');
  }

  get placeholder() {
    return this.querySummary.locator('[part="placeholder"]');
  }

  get highlights() {
    return this.querySummary.locator('[part*="highlight"]');
  }

  get queryHighlight() {
    return this.querySummary.locator('[part*="query"]');
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
