import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicProductChildrenPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-children');
  }

  get availableInLabel() {
    return this.page
      .locator('atomic-commerce-text')
      .filter({hasText: 'Available in:'});
  }

  get childProducts() {
    return this.page.getByRole('button');
  }
}
