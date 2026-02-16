import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class SmartSnippetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-smart-snippet');
  }

  get smartSnippet() {
    return this.hydrated;
  }
}
