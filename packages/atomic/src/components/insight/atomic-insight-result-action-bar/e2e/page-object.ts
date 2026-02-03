import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightResultActionBarObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-action-bar');
  }

  get actionBar() {
    return this.page.locator('atomic-insight-result-action-bar').first();
  }

  get result() {
    return this.page.locator('atomic-insight-result').first();
  }

  get buttons() {
    return this.actionBar.locator('button');
  }
}
