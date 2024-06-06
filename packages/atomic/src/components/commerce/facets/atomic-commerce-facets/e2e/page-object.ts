import type {Page} from '@playwright/test';

export class AtomicCommerceFacetsLocators {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  get inclusionFilters() {
    return this.page.getByLabel(/Inclusion filter/);
  }

  clearFilters(numberOfFilters?: number) {
    return this.page.getByLabel(
      new RegExp(`Clear ${numberOfFilters ?? '\\d'} filter for`)
    );
  }
}
