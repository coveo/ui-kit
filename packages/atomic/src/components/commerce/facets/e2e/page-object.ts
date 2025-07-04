import {BasePageObject} from '@/playwright-utils/base-page-object';
import type {Page} from '@playwright/test';

export class AnyFacetPageObject<
  FacetType extends
    | 'atomic-commerce-category-facet'
    | 'atomic-commerce-facet'
    | 'atomic-commerce-numeric-facet',
> extends BasePageObject<FacetType> {
  get searchInput() {
    return this.page.getByPlaceholder('Search');
  }

  get clearSearchInput() {
    return this.page.getByRole('button', {name: 'Clear'});
  }

  get showMore() {
    return this.page.getByLabel('Show more values');
  }

  get showLess() {
    return this.page.getByLabel('Show less values');
  }
}
