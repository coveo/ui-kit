import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightResultTemplateObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-template');
  }

  get result() {
    return this.page.locator('atomic-insight-result').first();
  }

  get error() {
    return this.page.locator('atomic-component-error').first();
  }

  get resultList() {
    return this.page.locator('atomic-insight-result-list');
  }

  get foldedResultList() {
    return this.page.locator('atomic-insight-folded-result-list');
  }
}
