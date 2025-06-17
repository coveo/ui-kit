import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

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

  async withNoProducts() {
    await this.page.route('**/commerce/v2/listing', async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      body.products = [];
      await route.fulfill({
        response,
        json: body,
      });
    });

    return this;
  }
}
