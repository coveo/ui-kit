import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultChildrenPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-children');
  }

  get childrenRoot() {
    return this.page.locator('[part="children-root"]');
  }

  get noResultRoot() {
    return this.page.locator('[part="no-result-root"]');
  }

  get showHideButton() {
    return this.page.locator('[part="show-hide-button"]');
  }

  get childResults() {
    return this.page.locator('atomic-insight-result.child-result');
  }
}
