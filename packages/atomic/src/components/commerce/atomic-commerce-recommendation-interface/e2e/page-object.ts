import {BasePageObject} from '@/playwright-utils/lit-base-page-object';
import type {Page} from '@playwright/test';

export class AtomicCommerceRecommendationInterfacePageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-recommendation-interface');
  }

  interface() {
    return this.page.locator('atomic-commerce-recommendation-interface');
  }
}
