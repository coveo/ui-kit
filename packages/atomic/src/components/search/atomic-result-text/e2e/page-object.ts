import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultTextPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-text');
  }

  get textContent() {
    return this.page.locator(
      'atomic-result-text:not(atomic-result-link atomic-result-text)'
    );
  }

  get highlightedText() {
    return this.page.locator(
      'atomic-result-text:not(atomic-result-link atomic-result-text) b'
    );
  }
}
