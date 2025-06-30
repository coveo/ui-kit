import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceRefineTogglePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-refine-toggle');
  }

  get button() {
    return this.page.getByRole('button', {name: 'Sort & Filter'});
  }

  get filters() {
    return this.page.getByRole('heading', {name: 'Filters'});
  }

  get sort() {
    return this.page.getByRole('heading', {name: 'Sort', exact: true});
  }
}
