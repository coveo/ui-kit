import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class AtomicResultPageObject extends BasePageObject<'atomic-result'> {
  constructor(page: Page) {
    super(page, 'atomic-result');
  }
}
