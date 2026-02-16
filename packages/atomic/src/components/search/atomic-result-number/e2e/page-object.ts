import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicResultNumberPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-number');
  }

  get formattedValue() {
    return this.hydrated.first();
  }
}
