import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class FieldConditionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-field-condition');
  }

  get conditionalContent() {
    return this.page.locator('atomic-field-condition');
  }

  get visibleCondition() {
    return this.page.locator('atomic-field-condition:visible');
  }
}
