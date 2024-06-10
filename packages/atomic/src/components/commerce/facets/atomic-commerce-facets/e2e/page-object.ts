import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwrightUtils/base-page-object';

export class FacetsPageObject extends BasePageObject<'atomic-commerce-facets'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-facets');
  }

  get container() {
    return this.page.locator('atomic-commerce-facets');
  }

  get standardFacets() {
    return this.container.locator('atomic-commerce-facet');
  }

  get numericFacets() {
    return this.container.locator('atomic-commerce-numeric-facet');
  }

  get timeframeFacets() {
    return this.container.locator('atomic-commerce-timeframe-facet');
  }

  get categoryFacets() {
    return this.container.locator('atomic-commerce-category-facet');
  }

  get collapsedFacets() {
    return this.container.locator('[aria-expanded="false"]');
  }

  get expandedFacets() {
    return this.container.locator('[aria-expanded="true"]');
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
