import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class FullSearchButtonPageObject extends BasePageObject<'atomic-insight-full-search-button'> {
  constructor(page: Page) {
    super(page, 'atomic-insight-full-search-button');
  }

  get button() {
    return this.page.locator('atomic-insight-full-search-button button');
  }
}
