import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class ResultImageObject extends BasePageObject<'atomic-result-image'> {
  constructor(page: Page) {
    super(page, 'atomic-result-image');
  }
}
