import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightQuerySummaryPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-query-summary');
  }

  get text() {
    return this.page.locator('div[part="container"]');
  }

  get ariaLive() {
    return this.page.getByRole('status');
  }
}
