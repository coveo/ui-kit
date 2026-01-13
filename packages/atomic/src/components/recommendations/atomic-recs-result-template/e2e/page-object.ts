import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RecsResultTemplateObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-recs-result-template');
  }

  get result() {
    return this.page.locator('atomic-recs-result').first();
  }

  get results() {
    return this.page.locator('atomic-recs-result');
  }

  get resultLink() {
    return this.page.locator('atomic-result-link').first();
  }

  get resultBadge() {
    return this.page.locator('atomic-result-badge').first();
  }

  get resultBadges() {
    return this.page.locator('atomic-result-badge');
  }

  get error() {
    return this.page.locator('atomic-component-error').first();
  }

  get recsList() {
    return this.page.locator('atomic-recs-list');
  }
}
