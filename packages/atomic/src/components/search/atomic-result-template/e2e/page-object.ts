import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultTemplateObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-template');
  }

  get result() {
    return this.page.locator('atomic-result').first();
  }

  get error() {
    return this.page.locator('atomic-component-error').first();
  }
}
