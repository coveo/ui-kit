import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicNumericFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-numeric-facet');
  }

  get facet() {
    return this.page.locator('atomic-numeric-facet');
  }

  get facetValues() {
    return this.facet.locator('[part="value-checkbox"]');
  }
}
