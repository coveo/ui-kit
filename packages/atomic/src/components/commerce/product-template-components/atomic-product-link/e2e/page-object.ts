import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class ProductLinkPageObject extends BasePageObject<'atomic-product-link'> {
  constructor(page: Page) {
    super(page, 'atomic-product-link');
  }

  anchor() {
    return this.page.getByRole('link');
  }
}
