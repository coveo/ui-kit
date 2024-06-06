import type {Page} from '@playwright/test';

export class AtomicCommerceTextLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get getText() {
    return this.page.locator('atomic-commerce-text');
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-text[class*="hydrated"]');
  }
}
