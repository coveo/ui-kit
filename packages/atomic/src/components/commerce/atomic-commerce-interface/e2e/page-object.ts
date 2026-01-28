import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceInterfacePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-interface');
  }

  getFacetValue(value: string | RegExp) {
    return this.page.getByRole('listitem').filter({hasText: value});
  }

  searchBox() {
    return this.page.locator('atomic-commerce-search-box');
  }

  productList() {
    return this.page.locator('atomic-commerce-product-list');
  }
}
