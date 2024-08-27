import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class ProductImageObject extends BasePageObject<'atomic-product-image'> {
  constructor(page: Page) {
    super(page, 'atomic-product-image');
  }
  // TODO tests
}
