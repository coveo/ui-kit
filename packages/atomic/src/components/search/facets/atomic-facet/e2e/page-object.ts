import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class AtomicFacetPageObject extends BasePageObject<'atomic-facet'> {
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
