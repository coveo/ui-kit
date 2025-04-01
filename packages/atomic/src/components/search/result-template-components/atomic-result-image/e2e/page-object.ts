import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class ResultImageObject extends BasePageObject<'atomic-result-image'> {
  constructor(page: Page) {
    super(page, 'atomic-result-image');
  }
}
