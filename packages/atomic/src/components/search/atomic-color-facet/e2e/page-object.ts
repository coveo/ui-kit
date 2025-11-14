import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicColorFacetPageObject extends BasePageObject {
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

  get labelButton() {
    return this.page.locator('[part="label-button"]').first();
  }

  get clearButton() {
    return this.page.locator('[part="clear-button"]').first();
  }

  get showMoreButton() {
    return this.page.locator('[part="show-more"]').first();
  }

  get showLessButton() {
    return this.page.locator('[part="show-less"]').first();
  }

  get facetValues() {
    return this.page.locator('[part="values"]');
  }
}
