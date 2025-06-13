import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class ProductTemplateObject extends BasePageObject<'atomic-product-template'> {
  constructor(page: Page) {
    super(page, 'atomic-product-template');
  }

  get product() {
    return this.page.locator('atomic-product[class*="hydrated"]').first();
  }

  get error() {
    return this.page.locator('atomic-component-error').first();
  }
}
