import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductListObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-product-list');
  }

  get placeholders() {
    return this.page.locator('atomic-result-placeholder');
  }

  get tablePlaceholders() {
    return this.page.locator('atomic-result-table-placeholder');
  }

  get products() {
    return this.page.locator('atomic-product');
  }

  get excerpts() {
    return this.page.locator('atomic-product-excerpt');
  }
}
