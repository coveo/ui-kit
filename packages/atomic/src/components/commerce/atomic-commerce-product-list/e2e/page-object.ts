import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class ProductListObject extends BasePageObject<'atomic-commerce-product-list'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-product-list');
  }

  get placeholders() {
    return this.page.locator('atomic-result-placeholder');
  }

  get products() {
    return this.page.locator('atomic-product');
  }
}
