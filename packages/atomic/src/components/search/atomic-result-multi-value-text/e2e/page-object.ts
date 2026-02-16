import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultMultiValueTextPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-multi-value-text');
  }

  get list() {
    return this.hydrated.locator('[part="result-multi-value-text-list"]');
  }

  get values() {
    return this.hydrated.locator('[part="result-multi-value-text-value"]');
  }

  get separators() {
    return this.hydrated.locator('[part="result-multi-value-text-separator"]');
  }

  get moreLabel() {
    return this.hydrated.locator('[part="result-multi-value-text-value-more"]');
  }

  value(index: number) {
    return this.values.nth(index);
  }
}
