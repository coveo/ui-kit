import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicAutomaticFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-automatic-facet');
  }

  get facetLabel() {
    return this.page.locator('atomic-automatic-facet [part="label-button"]');
  }

  get facetValues() {
    return this.page.locator('atomic-automatic-facet [part="values"] > li');
  }

  get clearButton() {
    return this.page.locator('atomic-automatic-facet [part="clear-button"]');
  }

  get firstFacetValue() {
    return this.facetValues.first();
  }
}
