import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class ProductTemplateObject extends BasePageObject<'atomic-product-template'> {
  constructor(page: Page) {
    super(page, 'atomic-product-template');
  }
  /**
   * What to tests ?
   *
   */
}
