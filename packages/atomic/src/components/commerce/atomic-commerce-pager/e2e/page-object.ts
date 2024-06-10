import type {Page} from '@playwright/test';

export class AtomicCommercePagerLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-pager[class*="hydrated"]');
  }

  get numericButtons() {
    return this.page.getByRole('radio');
  }

  get previousButton() {
    return this.page.getByLabel('Previous');
  }

  get nextButton() {
    return this.page.getByLabel('Next');
  }
}
