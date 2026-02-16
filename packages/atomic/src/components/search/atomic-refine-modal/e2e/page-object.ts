import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RefineModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-refine-modal');
  }

  get modal() {
    return this.page.getByRole('dialog', {name: 'Sort & Filter'});
  }
  get title() {
    return this.page.getByRole('heading', {name: 'Sort & Filter'});
  }

  get closeButton() {
    return this.hydrated.getByRole('button', {name: 'Close'});
  }

  get sortTitle() {
    return this.page.getByRole('heading', {name: 'Sort', exact: true});
  }

  get sortDropdown() {
    return this.hydrated.getByLabel('Sort by');
  }

  get filtersTitle() {
    return this.page.getByRole('heading', {name: 'Filters'});
  }

  get viewResultsButton() {
    return this.page.getByRole('heading', {name: 'Sort', exact: true});
  }

  get clearFiltersButton() {
    return this.page.getByRole('button', {name: 'Clear'});
  }
}
