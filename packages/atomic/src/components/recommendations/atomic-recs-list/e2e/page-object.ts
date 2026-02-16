import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicRecsListPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-recs-list');
  }

  get recommendations() {
    return this.page.locator(
      '[part="result-list-grid-clickable-container outline"]'
    );
  }
}
