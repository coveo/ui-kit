import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicQuerySummaryPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-query-summary');
  }

  get text() {
    return this.page
      .locator('div[part="container"]')
      .filter({hasText: /Results \d+-\d+ of [\d,]+/});
  }

  get ariaLive() {
    return this.page
      .getByRole('status')
      .filter({hasText: /Results \d+-\d+ of [\d,]+/});
  }

  get duration() {
    return this.page.locator('span[part="duration"]');
  }
}
