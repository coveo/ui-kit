import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicRefineModalPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-refine-modal');
  }

  get closeButton() {
    return this.hydrated.getByRole('button', {name: 'Close'});
  }

  get sortDropdown() {
    return this.hydrated.getByLabel('Sort by');
  }

  get viewResultsButton() {
    return this.hydrated.getByRole('button', {name: /View \d+ results/i});
  }

  get clearFiltersButton() {
    return this.hydrated.getByRole('button', {name: 'Clear'});
  }
}
