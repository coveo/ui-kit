import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultLocalizedTextPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-localized-text');
  }

  get textContent() {
    return this.page.locator('atomic-result-localized-text');
  }
}
