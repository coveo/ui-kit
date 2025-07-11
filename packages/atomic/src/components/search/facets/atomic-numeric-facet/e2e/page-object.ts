import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class AtomicNumericFacetPageObject extends BasePageObject<'atomic-numeric-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-numeric-facet');
  }

  get facet() {
    return this.page.locator('atomic-numeric-facet');
  }

  get facetInputStart() {
    return this.facet.getByLabel('Enter a minimum numerical value');
  }

  get facetInputEnd() {
    return this.facet.getByLabel('Enter a maximum numerical value');
  }

  get facetApplyButton() {
    return this.facet.getByLabel('Apply custom numerical values');
  }

  get facetClearFilterButton() {
    return this.facet.getByRole('button').filter({hasText: 'Clear filter'});
  }

  get facetValues() {
    return this.facet.locator('[part="value-checkbox"]');
  }
}
