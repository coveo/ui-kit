import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicCommercePagerLocators extends BasePageObject<'atomic-commerce-pager'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-pager');
  }

  get errorComponent() {
    return this.page.locator('atomic-component-error');
  }

  get pages() {
    return this.page.getByLabel(/Page \d/);
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
