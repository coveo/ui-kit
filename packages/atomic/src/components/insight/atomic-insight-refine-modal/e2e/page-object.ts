import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightRefineModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-refine-modal');
  }

  get title() {
    return this.page.getByRole('heading', {name: 'Filters'});
  }

  get closeButton() {
    return this.hydrated.getByRole('button', {name: 'Close'});
  }

  get viewResultsButton() {
    return this.page.getByRole('button', {name: /View/});
  }
}
