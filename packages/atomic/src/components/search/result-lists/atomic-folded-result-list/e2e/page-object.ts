import {BasePageObject} from '@coveo/atomic/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class AtomicFoldedResultListPageObject extends BasePageObject<'atomic-folded-result-list'> {
  constructor(page: Page) {
    super(page, 'atomic-folded-result-list');
  }

  get noResultsLabel() {
    return this.page.locator('[part="no-result-root"]');
  }
}
