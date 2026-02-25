import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightResultChildrenTemplateObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-children-template');
  }

  get childResult() {
    return this.page.locator('atomic-insight-result').first();
  }

  get error() {
    return this.page.locator('atomic-component-error').first();
  }

  get resultChildren() {
    return this.page.locator('atomic-insight-result-children');
  }

  get childrenRoot() {
    return this.page.locator('[part="children-root"]');
  }
}
