import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultChildrenTemplateObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-children-template');
  }

  get childResult() {
    return this.page.locator('atomic-result').first();
  }

  get error() {
    return this.page.locator('atomic-component-error').first();
  }

  get foldedResultList() {
    return this.page.locator('atomic-folded-result-list');
  }
}
