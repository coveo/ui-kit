import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceRecommendationInterfacePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-recommendation-interface');
  }

  interface() {
    return this.page.locator('atomic-commerce-recommendation-interface');
  }

  recommendationList() {
    return this.page.locator('atomic-commerce-recommendation-list');
  }

  previousButton() {
    return this.page.locator('button[part="previous-button"]');
  }
}
