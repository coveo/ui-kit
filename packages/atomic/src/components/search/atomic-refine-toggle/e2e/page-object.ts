import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RefineTogglePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-refine-toggle');
  }
  get button() {
    return this.page.getByRole('button', {name: 'Sort & Filter'});
  }
}
