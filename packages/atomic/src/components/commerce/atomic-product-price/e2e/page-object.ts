import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductPricePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-price');
  }

  get blueLagoonPrice() {
    return this.page.getByText('$1,000.00');
  }

  get AquaMarinaPrice() {
    return this.page.getByText('$39.00');
  }

  get AquaMarinaPromoPrice() {
    return this.page.getByText('$36.00');
  }
}
