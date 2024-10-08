import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicCommerceRecommendationList extends BasePageObject<'atomic-commerce-recommendation-list'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-recommendation-list');
  }

  get placeholder() {
    return this.page.locator('.placeholder');
  }

  get recommendation() {
    return this.page.locator(
      '[part="result-list-grid-clickable-container outline"]'
    );
  }

  get indicators() {
    return this.page.getByRole('listitem');
  }

  get nextButton() {
    return this.page.getByLabel('Next');
  }

  get prevButton() {
    return this.page.getByLabel('Previous');
  }
}
