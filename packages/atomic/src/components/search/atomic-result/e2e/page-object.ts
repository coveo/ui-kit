import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class AtomicResultPageObject extends BasePageObject<'atomic-result'> {
  constructor(page: Page) {
    super(page, 'atomic-result');
  }
}
