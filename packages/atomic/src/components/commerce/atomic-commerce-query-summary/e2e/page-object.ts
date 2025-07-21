import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class QuerySummaryPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-query-summary');
  }

  get text() {
    return this.page
      .locator('div[part="container"]')
      .filter({hasText: /Products \d+-\d+ of [\d,]+/});
  }

  get ariaLive() {
    return this.page
      .getByRole('status')
      .filter({hasText: /Products \d+-\d+ of [\d,]+/});
  }
}
