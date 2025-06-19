import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class ProductLinkPageObject extends BasePageObject<'atomic-product-link'> {
  constructor(page: Page) {
    super(page, 'atomic-product-link');
  }

  anchor() {
    return this.page.getByRole('link');
  }
}
