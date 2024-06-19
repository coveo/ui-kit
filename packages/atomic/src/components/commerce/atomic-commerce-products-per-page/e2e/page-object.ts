import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class LoadMoreProductsPageObject extends BasePageObject<'atomic-commerce-products-per-page'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-products-per-page');
  }
}
