import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class ProductPricePageObject extends BasePageObject<'atomic-product-price'> {
  constructor(page: Page) {
    super(page, 'atomic-product-price');
  }
}
