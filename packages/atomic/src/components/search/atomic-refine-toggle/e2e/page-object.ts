import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class RefineTogglePageObject extends BasePageObject<'atomic-refine-toggle'> {
  constructor(page: Page) {
    super(page, 'atomic-refine-toggle');
  }
  get button() {
    return this.page.getByRole('button', {name: 'Sort & Filter'});
  }
}
