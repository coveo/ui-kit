import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultAttachToCaseActionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-attach-to-case-action');
  }
}
