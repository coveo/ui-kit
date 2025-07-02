import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class ProductsPerPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-products-per-page');
  }
  choice(value: number) {
    return this.page.getByLabel(value.toString(), {exact: true});
  }
}
