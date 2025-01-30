import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class AtomicTimeframeFacetPageObject extends BasePageObject<'atomic-timeframe-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-timeframe-facet');
  }

  get getFacetSearch() {
    return this.page.getByLabel('Search');
  }

  get facetInputStart() {
    return this.page.getByLabel('Enter a start date');
  }

  get facetInputEnd() {
    return this.page.getByLabel('Enter an end date');
  }

  get facetApplyButton() {
    return this.page.getByRole('button', {
      name: 'Apply custom start and end dates',
    });
  }

  get facetClearFilter() {
    return this.page.getByRole('button').filter({hasText: 'Clear filter'});
  }
}
