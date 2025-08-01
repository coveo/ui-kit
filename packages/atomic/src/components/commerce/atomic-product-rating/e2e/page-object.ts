import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductRatingPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-rating');
  }

  get blueLagoonYellowIcons() {
    return this.page
      .getByRole('img', {name: /stars out of \d+/})
      .locator('div')
      .nth(1);
  }
}
