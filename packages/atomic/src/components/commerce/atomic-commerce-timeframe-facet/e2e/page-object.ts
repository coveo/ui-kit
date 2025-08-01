import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicCommerceTimeframeFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-commerce-timeframe-facet');
  }

  get facet() {
    return this.page.locator('atomic-commerce-timeframe-facet');
  }

  get facetInputStart() {
    return this.facet.getByLabel('Enter a start date');
  }

  get facetInputEnd() {
    return this.facet.getByLabel('Enter an end date');
  }

  get facetApplyButton() {
    return this.facet.getByRole('button', {
      name: 'Apply custom start and end dates',
    });
  }

  get facetValues() {
    return this.facet.getByLabel('Inclusion filter on');
  }

  get facetClearFilterButton() {
    return this.facet.getByRole('button').filter({hasText: 'Clear filter'});
  }
}
