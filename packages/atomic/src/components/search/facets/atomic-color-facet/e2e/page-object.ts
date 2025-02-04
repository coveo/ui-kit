import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class AtomicColorFacetPageObject extends BasePageObject<'atomic-color-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-color-facet');
  }

  get getFacetSearch() {
    return this.page.getByLabel('Search');
  }

  get getFacetValue() {
    return this.page.locator('[part="value-box"]');
  }

  get facetSearchMoreMatchesFor() {
    return this.page.getByRole('button', {name: 'More matches for p'});
  }
}
