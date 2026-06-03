import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightResultListPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-list');
  }

  get results() {
    return this.page.locator('atomic-insight-result');
  }

  get firstResult() {
    return this.results.first();
  }

  get listRoot() {
    return this.page.locator('[part="result-list"]');
  }
}
