import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicSortExpressionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-sort-expression');
  }

  get sortDropdown() {
    return this.page.locator('atomic-sort-dropdown');
  }

  get sortDropdownButton() {
    return this.page.locator('atomic-sort-dropdown button');
  }

  getSortOption(label: string) {
    return this.page.getByRole('option', {name: label});
  }

  async openSortDropdown() {
    await this.sortDropdownButton.click();
  }

  async selectSortOption(label: string) {
    await this.openSortDropdown();
    await this.getSortOption(label).click();
  }
}
