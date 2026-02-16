import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ProductFieldConditionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-product-field-condition');
  }

  get conditionalContent() {
    return this.page.locator('atomic-product-field-condition');
  }

  get visibleConditions() {
    return this.page.locator('atomic-product-field-condition:visible');
  }
}
