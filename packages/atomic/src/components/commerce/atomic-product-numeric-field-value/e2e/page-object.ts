import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class NumericFieldValuePageObject extends BasePageObject<'atomic-product-numeric-field-value'> {
  constructor(page: Page) {
    super(page, 'atomic-product-numeric-field-value');
  }

  get value() {
    return this.page.locator('atomic-product-numeric-field-value');
  }
}
