import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultBadgePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-badge');
  }

  get badgeElement() {
    return this.page.locator('[part="result-badge-element"]');
  }

  get badgeIcon() {
    return this.page.locator('[part="result-badge-icon"]');
  }

  get badgeLabel() {
    return this.page.locator('[part="result-badge-label"]');
  }

  get textContent() {
    return this.page.locator('atomic-text');
  }

  get resultTextField() {
    return this.page.locator('atomic-result-text');
  }
}
