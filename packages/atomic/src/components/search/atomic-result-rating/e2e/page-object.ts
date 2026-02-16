import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultRatingPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-rating');
  }

  get ratingContainer() {
    return this.page.locator('atomic-result-rating [part="value-rating"]');
  }

  get ratingIcons() {
    return this.page.locator('atomic-result-rating [part="value-rating-icon"]');
  }
}
