import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class ProductRatingPageObject extends BasePageObject<'atomic-product-rating'> {
  constructor(page: Page) {
    super(page, 'atomic-product-rating');
  }

  // get first result, check the yellow star things, check if width is 80%
}
