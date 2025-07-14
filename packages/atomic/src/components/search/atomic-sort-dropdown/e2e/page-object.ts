import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicSortDropdownPageObject extends BasePageObject<'atomic-sort-dropdown'> {
  constructor(page: Page) {
    super(page, 'atomic-sort-dropdown');
  }

  get dropdown() {
    return this.page.getByLabel('Sort by');
  }
}
