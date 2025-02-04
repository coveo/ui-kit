import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class AtomicSortDropdownPageObject extends BasePageObject<'atomic-sort-dropdown'> {
  constructor(page: Page) {
    super(page, 'atomic-sort-dropdown');
  }

  get dropdown() {
    return this.page.getByLabel('Sort by');
  }
}
