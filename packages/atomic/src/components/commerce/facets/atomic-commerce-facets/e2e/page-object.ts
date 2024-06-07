import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwrightUtils/base-page-object';

export class AtomicCommerceFacets extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-facets');
  }

  get inclusionFilters() {
    return this.page.getByLabel(/Inclusion filter/);
  }

  clearFilters(numberOfFilters?: number) {
    return this.page.getByLabel(
      new RegExp(`Clear ${numberOfFilters ?? '\\d'} filter for`)
    );
  }

  get hydrated() {
    return this.page.locator(`${this.tag}[class*="hydrated"]`);
  }
}
