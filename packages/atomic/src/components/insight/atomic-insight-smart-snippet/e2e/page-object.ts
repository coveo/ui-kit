import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightSmartSnippetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-smart-snippet');
  }

  get smartSnippet() {
    return this.hydrated;
  }
}
