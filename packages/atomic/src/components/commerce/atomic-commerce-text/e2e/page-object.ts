import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class AtomicCommerceText extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-text');
  }

  get getText() {
    return this.page.locator('atomic-commerce-text');
  }
}
