import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceRecommendationListPageObject extends BasePageObject {
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
    return this.page.locator('[part="indicators"]').getByRole('listitem');
  }

  get nextButton() {
    return this.page.getByLabel('Next');
  }

  get prevButton() {
    return this.page.getByLabel('Previous');
  }
}
