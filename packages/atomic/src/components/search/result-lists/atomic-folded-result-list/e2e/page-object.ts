import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class AtomicFoldedResultListPageObject extends BasePageObject<'atomic-folded-result-list'> {
  constructor(page: Page) {
    super(page, 'atomic-folded-result-list');
  }

  get noResultsLabel() {
    return this.page.locator('[part="no-result-root"]');
  }

  get loadAllResultsButton() {
    return this.page.getByRole('button', {name: 'Load all results'});
  }
}
