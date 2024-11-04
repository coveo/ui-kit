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
