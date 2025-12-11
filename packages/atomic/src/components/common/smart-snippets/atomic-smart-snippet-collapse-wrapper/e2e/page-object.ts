import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class SmartSnippetCollapseWrapperPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-smart-snippet-collapse-wrapper');
  }

  get wrapper() {
    return this.hydrated.locator('[part="smart-snippet-collapse-wrapper"]');
  }

  get showMoreButton() {
    return this.hydrated.locator('[part="show-more-button"]');
  }

  get showLessButton() {
    return this.hydrated.locator('[part="show-less-button"]');
  }

  get button() {
    return this.hydrated.locator('button');
  }
}
