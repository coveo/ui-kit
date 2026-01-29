import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultChildrenPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-children');
  }

  get childrenRoot() {
    return this.page.locator('[part="children-root"]');
  }
}
