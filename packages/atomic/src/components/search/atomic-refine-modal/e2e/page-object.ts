import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class RefineModalPageObject extends BasePageObject<'atomic-refine-toggle'> {
  constructor(page: Page) {
    super(page, 'atomic-refine-toggle');
  }

  get modal() {
    return this.page.getByRole('dialog', {name: 'Sort & Filter'});
  }
}
