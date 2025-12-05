import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultChildrenObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-children');
  }
}
