import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicCommerceText extends BasePageObject<'atomic-commerce-text'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-text');
  }

  get getText() {
    return this.page.locator('atomic-commerce-text');
  }
}
