import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultActionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-action');
  }

  get actionButton() {
    return this.page.locator('[part="result-action-button"]');
  }

  get actionIcon() {
    return this.page.locator('[part="result-action-icon"]');
  }

  get actionContainer() {
    return this.page.locator('[part="result-action-container"]');
  }
}
