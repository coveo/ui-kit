import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicIpxRecsListPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-ipx-recs-list');
  }

  get recommendation() {
    return this.hydrated.locator(
      '[part~="result-list-grid-clickable-container"]'
    );
  }
}
