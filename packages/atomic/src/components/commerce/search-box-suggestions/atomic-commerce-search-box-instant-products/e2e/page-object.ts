import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class InstantProductPageObject extends BasePageObject<'atomic-commerce-search-box-instant-products'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-search-box-instant-products');
  }

  get component() {
    return this.page.locator('atomic-commerce-search-box-instant-products');
  }

  get products() {
    // return this.component.locator('[part~="instant-results-item"]');
    return this.component.getByLabel('instant result');
  }

  get activeProduct() {
    // return this.component.locator(
    //   '[part~="active-suggestion"][part~="instant-results-item"]'
    // );
    return this.products.filter({
      has: this.component.locator('[part~="active-suggestion"]'),
    });
  }

  get showAllButton() {
    return this.component.getByLabel('See all results');
  }
}
