import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicResultTablePlaceholderPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-table-placeholder');
  }

  get table() {
    return this.page.locator('atomic-result-table-placeholder table');
  }

  get thead() {
    return this.table.locator('thead');
  }

  get tbody() {
    return this.table.locator('tbody');
  }

  get headerRows() {
    return this.thead.locator('tr');
  }

  get bodyRows() {
    return this.tbody.locator('tr');
  }

  get headerCells() {
    return this.thead.locator('th');
  }

  async getRowCount() {
    return this.bodyRows.count();
  }
}
