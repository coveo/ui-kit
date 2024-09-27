import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../playwright-utils/base-page-object';

export class RecsInterfacePageObject extends BasePageObject<'atomic-recs-interface'> {
  constructor(page: Page) {
    super(page, 'atomic-recs-interface');
  }
}
