import type {Page} from '@playwright/test';

export class AtomicCommercePagerLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-pager[class*="hydrated"]');
  }

  // TODO: inherit from a base class to prevent having to redefine this in every page object
  get errorComponent() {
    return this.page.locator('atomic-component-error');
  }

  get pages() {
    return this.page.getByLabel('Page {{page}}');
  }

  numericButton(pageNumber: number) {
    return this.page.locator(`[value="${pageNumber}"]`);
  }

  get previousButton() {
    return this.page.getByLabel('Previous');
  }

  get previousButtonIcon() {
    return this.previousButton.locator('atomic-icon');
  }

  get nextButton() {
    return this.page.getByLabel('Next');
  }

  get nextButtonIcon() {
    return this.nextButton.locator('atomic-icon');
  }
}
