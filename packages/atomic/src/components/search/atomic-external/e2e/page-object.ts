import {BasePageObject} from '@/playwright-utils/base-page-object';
import {Page} from '@playwright/test';

export class AtomicExternalPageObject extends BasePageObject<'atomic-external'> {
  constructor(page: Page) {
    super(page, 'atomic-external');
  }

  get searchBox() {
    return this.page.locator('atomic-external > atomic-search-box');
  }

  get querySummary() {
    return this.page.locator('atomic-external > atomic-query-summary');
  }
}
