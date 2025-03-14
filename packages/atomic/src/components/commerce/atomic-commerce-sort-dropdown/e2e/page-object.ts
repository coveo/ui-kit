import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class AtomicCommerceSortDropdownPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-sort-dropdown');
  }

  get label() {
    return this.page.getByText('Sort by:');
  }

  get select() {
    return this.page.getByRole('combobox');
  }

  get placeholder() {
    return this.page.locator('[part="placeholder"]')!;
  }
}
