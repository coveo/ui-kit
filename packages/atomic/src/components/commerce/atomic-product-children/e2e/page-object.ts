import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicProductChildrenPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-children');
  }

  get label() {
    return this.page.locator('atomic-commerce-text');
  }

  get childProducts() {
    return this.page.getByRole('button');
  }
}
