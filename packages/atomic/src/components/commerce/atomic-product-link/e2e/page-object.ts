import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductLinkPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-link');
  }

  anchor() {
    return this.page.getByRole('link');
  }
}
