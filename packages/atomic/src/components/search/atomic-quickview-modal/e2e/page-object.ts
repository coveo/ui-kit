import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class QuickviewModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-quickview-modal');
  }

  get quickviewButton() {
    return this.page.getByRole('button', {name: 'Quick View'});
  }

  get modal() {
    return this.page.getByRole('dialog');
  }
}
