import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class IpxButtonPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-button');
  }

  get button() {
    return this.page.locator('atomic-ipx-button').getByRole('button');
  }

  get buttonText() {
    return this.page.locator('atomic-ipx-button [part="button-text"]');
  }
}
