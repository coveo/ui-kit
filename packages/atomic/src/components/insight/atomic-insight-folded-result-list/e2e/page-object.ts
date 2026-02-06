import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightFoldedResultListPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-folded-result-list');
  }

  get resultList() {
    return this.page.locator('[part="result-list"]');
  }

  get resultChildren() {
    return this.page.locator('[part="children-root"]');
  }

  get results() {
    return this.page.locator('atomic-insight-result');
  }

  get loadAllResultsButton() {
    return this.page.getByRole('button', {name: 'Load all results'});
  }

  get collapseResultsButton() {
    return this.page.getByRole('button', {name: 'Collapse results'});
  }
}
