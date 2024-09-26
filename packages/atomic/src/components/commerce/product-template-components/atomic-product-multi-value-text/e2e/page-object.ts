import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class ProductMultiValueTextPageObject extends BasePageObject<'atomic-product-multi-value-text'> {
  constructor(page: Page) {
    super(page, 'atomic-product-multi-value-text');
  }
}
