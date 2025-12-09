import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultFieldsListPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-fields-list');
  }

  get children() {
    return this.page.locator('atomic-result-fields-list > *');
  }

  get hiddenChildren() {
    return this.page.locator(
      'atomic-result-fields-list > *[style*="display: none"]'
    );
  }

  get visibleChildren() {
    return this.page.locator(
      'atomic-result-fields-list > *:not([style*="display: none"])'
    );
  }

  get childrenWithHiddenDividers() {
    return this.page.locator('atomic-result-fields-list > *.hide-divider');
  }

  get atomicText() {
    return this.page.locator('atomic-text');
  }
}
