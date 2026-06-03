import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RecsInterfacePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-recs-interface');
  }

  interface() {
    return this.page.locator('atomic-recs-interface');
  }

  recsList() {
    return this.page.locator('atomic-recs-list');
  }

  recsResults() {
    return this.page.locator('atomic-recs-result');
  }

  getResultLink(nth: number = 0) {
    return this.recsResults().nth(nth).locator('atomic-result-link');
  }
}
