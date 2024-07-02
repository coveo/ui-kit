import type {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class FacetPageObject extends BasePageObject<'atomic-commerce-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-facet');
  }

  get title() {
    return this.page.getByText('Brand');
  }

  get searchInput() {
    return this.page.getByPlaceholder('Search');
  }

  get clearSearchInput() {
    return this.page.getByRole('button', {name: 'Clear'});
  }

  getFacetValue(value: string) {
    return this.page.getByRole('listitem').filter({hasText: value});
  }

  getFacetValueButton(value: string) {
    return this.page.getByLabel(`Inclusion filter on ${value}`);
  }

  get clearFilter() {
    return this.page.getByRole('button').filter({hasText: /Clear.*filter/});
  }

  get showMore() {
    return this.page.getByLabel('Show more values');
  }

  get showLess() {
    return this.page.getByLabel('Show less values');
  }
}
