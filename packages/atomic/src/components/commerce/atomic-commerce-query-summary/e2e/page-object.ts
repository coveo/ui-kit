import type {Page} from '@playwright/test';

export class QuerySummaryPageObject {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get hydrated() {
    return this.page.locator(
      'atomic-commerce-query-summary[class*="hydrated"]'
    );
  }

  get placeholder() {
    return this.page.locator('[part="placeholder"]');
  }

  ariaLive(textRegex: RegExp) {
    return this.page.getByRole('status').filter({hasText: textRegex});
  }

  text(summaryRegex: RegExp) {
    return this.page.getByText(summaryRegex);
  }
}
