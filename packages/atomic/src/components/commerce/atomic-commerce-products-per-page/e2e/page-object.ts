import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class ProductsPerPageObject extends BasePageObject<'atomic-commerce-products-per-page'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-products-per-page');
  }
  label() {
    return this.page.getByText('Products per page');
  }
  choice(value: number) {
    return this.page.getByLabel(value?.toString(), {exact: true});
  }
  get error() {
    return this.page.locator('atomic-component-error').first();
  }
}
