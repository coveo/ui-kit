import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class FacetsPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-facets');
  }
  get standardFacets() {
    return this.page
      .getByText('Brand')
      .or(this.page.getByText('Color'))
      .or(this.page.getByText('Size'));
  }

  get numericFacets() {
    return this.page.getByText('Price');
  }

  get categoryFacets() {
    return this.page.getByText('Category');
  }

  get collapsedFacets() {
    return this.page.getByRole('button', {expanded: false});
  }

  get expandedFacets() {
    return this.page.getByRole('button', {expanded: true});
  }

  get inclusionFilters() {
    return this.page.getByLabel(/Inclusion filter/);
  }

  get placeholders() {
    return this.page.locator('[part="placeholder"]');
  }

  clearFilters(numberOfFilters?: number) {
    return this.page.getByLabel(
      new RegExp(`Clear ${numberOfFilters ?? '\\d'} filter for`)
    );
  }
}
