import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class ProductTemplateObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-template');
  }

  get product() {
    return this.page.locator('atomic-product').first();
  }

  get error() {
    return this.page.locator('atomic-component-error').first();
  }
}
