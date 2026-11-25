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

  get resultLink() {
    return this.result.locator('atomic-result-link a');
  }

  get buttons() {
    return this.actionBar.locator('button');
  }

  get copyToClipboardButton() {
    return this.actionBar.locator(
      'atomic-insight-result-action[action="copyToClipboard"] [part="result-action-button"]'
    );
  }
}
