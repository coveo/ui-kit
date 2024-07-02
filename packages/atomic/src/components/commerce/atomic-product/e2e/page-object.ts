import type {Page} from '@playwright/test';

export class AtomicCommerceProductsPageObject {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-product-list[class*="hydrated"]');
  }

  get results() {
    return this.page.locator('[part="result-list"] atomic-product');
  }
}
