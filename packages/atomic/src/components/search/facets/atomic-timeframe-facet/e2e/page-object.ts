import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicTimeframeFacetPageObject extends BasePageObject<'atomic-timeframe-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-timeframe-facet');
  }

  get facet() {
    return this.page.locator('atomic-timeframe-facet');
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
