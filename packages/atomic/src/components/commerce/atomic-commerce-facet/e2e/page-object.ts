import type {Page} from '@playwright/test';
import {AnyFacetPageObject} from '@/src/components/common/facets/e2e/page-object';

export class FacetPageObject extends AnyFacetPageObject<'atomic-commerce-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-facet');
  }

  get title() {
    return this.page.getByText('Brand');
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-facet[field="ec_brand"]');
  }

  get searchInput() {
    return this.page.getByLabel('Search for values in the Brand facet');
  }

  get clearSearchInput() {
    return this.hydrated.getByRole('button', {name: 'Clear'});
  }

  get showMore() {
    return this.page.getByLabel('Show more values for the Brand facet');
  }

  get showLess() {
    return this.page.getByLabel('Show less values for the Brand facet');
  }

  getFacetValueButtonByPosition(valuePosition: number) {
    const value = this.getFacetValueByPosition(valuePosition);
    return value.locator('button');
  }

  getFacetValueByPosition(valuePosition: number) {
    return this.hydrated.getByRole('listitem').nth(valuePosition);
  }

  getFacetValueByLabel(value: string | RegExp) {
    return this.hydrated.getByRole('listitem').filter({hasText: value});
  }

  getFacetValueButtonByLabel(value: string | RegExp) {
    return this.page.getByLabel(`Inclusion filter on ${value}`);
  }

  get clearFilter() {
    return this.hydrated.getByRole('button').filter({hasText: /Clear.*filter/});
  }
}
