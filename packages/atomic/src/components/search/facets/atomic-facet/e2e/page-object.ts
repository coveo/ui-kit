import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class AtomicFacetPageObject extends BasePageObject<'atomic-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-facet');
  }

  get expandButtons() {
    return this.page.getByRole('button', {name: /Expand the \w* facet/});
  }

  get getFacetSearch() {
    return this.page.getByLabel('Search');
  }

  get getFacetValue() {
    return this.page.locator('[part="value-checkbox"]');
  }

  get facetSearchMoreMatchesFor() {
    return this.page.getByRole('button', {name: 'More matches for p'});
  }
}
