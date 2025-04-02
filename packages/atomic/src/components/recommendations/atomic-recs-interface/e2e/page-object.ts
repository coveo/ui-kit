import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class RecsInterfacePageObject extends BasePageObject<'atomic-recs-interface'> {
  constructor(page: Page) {
    super(page, 'atomic-recs-interface');
  }
}
