import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicExternalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-external');
  }

  get searchBox() {
    return this.page.locator('atomic-external > atomic-search-box');
  }

  get querySummary() {
    return this.page.locator('atomic-external > atomic-query-summary');
  }
}
