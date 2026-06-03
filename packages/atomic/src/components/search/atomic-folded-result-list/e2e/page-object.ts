import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicFoldedResultListPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-folded-result-list');
  }

  get noResultsLabel() {
    return this.page.locator('[part="no-result-root"]');
  }

  get loadAllResultsButton() {
    return this.page.getByRole('button', {name: 'Load all results'});
  }

  get collapseResultsButton() {
    return this.page.getByRole('button', {name: 'Collapse results'});
  }

  get resultChildren() {
    return this.page.locator('[part="children-root"]');
  }
}
