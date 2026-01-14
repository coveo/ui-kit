import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class InsightRefineModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-refine-modal');
  }

  get modal() {
    return this.page.getByRole('dialog', {name: 'Filters'});
  }
  get title() {
    return this.page.getByRole('heading', {name: 'Filters'});
  }

  get closeButton() {
    return this.hydrated.getByRole('button', {name: 'Close'});
  }

  get filtersTitle() {
    return this.page.getByRole('heading', {name: 'Filters'});
  }

  get viewResultsButton() {
    return this.page.getByRole('button', {name: /View/});
  }

  get clearFiltersButton() {
    return this.page.getByRole('button', {name: 'Clear'});
  }
}
