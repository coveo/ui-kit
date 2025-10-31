import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result');
    this.page = page;
  }

  get hydrated() {
    return this.page.locator('atomic-result');
  }

  get ResultsPerPage() {
    return this.page.locator('[part="result-list"] atomic-result');
  }
}
