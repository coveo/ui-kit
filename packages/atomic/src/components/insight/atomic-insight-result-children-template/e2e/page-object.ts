import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightResultChildrenTemplateObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-children-template');
  }

  get childResult() {
    return this.page.locator('atomic-insight-result').first();
  }

  get childrenRoot() {
    return this.page.locator('[part="children-root"]');
  }
}
