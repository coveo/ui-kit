import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-facet');
  }

  get expandButtons() {
    return this.page.getByRole('button', {name: /Expand the \w* facet/});
  }

  get facetSearch() {
    return this.page.getByLabel('Search');
  }

  get facetValue() {
    return this.page.locator('ul[part="values"] > li');
  }

  get facetValueLabel() {
    return this.page.locator('ul[part="values"] > li span[part="value-label"]');
  }

  get facetValueOccurrences() {
    return this.page.locator('ul[part="values"] > li span[part="value-count"]');
  }

  get facetSearchMoreMatchesFor() {
    return this.page.getByRole('button', {name: 'More matches for p'});
  }

  get showMoreButton() {
    return this.page.getByRole('button', {name: 'Show more'});
  }

  get showLessButton() {
    return this.page.getByRole('button', {name: 'Show less'});
  }
}
