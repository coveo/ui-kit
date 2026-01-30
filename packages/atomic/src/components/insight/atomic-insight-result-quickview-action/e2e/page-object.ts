import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultQuickviewActionLocators extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-quickview-action');
  }

  get resultButton() {
    return this.page.getByRole('button', {name: 'Quick View'}).first();
  }
}
