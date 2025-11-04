import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultRatingPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-rating');
  }

  get yellowIcons() {
    return this.page
      .getByRole('img', {name: /stars out of \d+/})
      .locator('div')
      .nth(1);
  }
}
