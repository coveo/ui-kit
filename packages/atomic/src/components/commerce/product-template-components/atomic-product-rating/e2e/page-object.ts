import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class ProductRatingPageObject extends BasePageObject<'atomic-product-rating'> {
  constructor(page: Page) {
    super(page, 'atomic-product-rating');
  }

  get blueLagoonYellowIcons() {
    return this.page
      .getByLabel('4 stars out of', {exact: false})
      .locator('div')
      .nth(1);
  }
}
