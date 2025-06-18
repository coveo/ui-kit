import type {Page} from '@playwright/test';

export class ProductsPageObject {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-product-list');
  }

  get products() {
    return this.page.locator('[part="result-list"] atomic-product');
  }
}
