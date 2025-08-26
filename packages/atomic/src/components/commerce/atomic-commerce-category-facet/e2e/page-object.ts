import type {Page} from '@playwright/test';
import {AnyFacetPageObject} from '@/src/components/common/facets/e2e/page-object';

export class CategoryFacetPageObject extends AnyFacetPageObject<'atomic-commerce-category-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-category-facet');
  }

  get title() {
    return this.page.getByText('Category');
  }

  get hydrated() {
    // Find the category facet by looking for the one that contains the "Category" text
    return this.page
      .locator('atomic-commerce-category-facet')
      .filter({hasText: 'Category'});
  }

  get searchInput() {
    return this.page.getByLabel('Search for values in the Category facet');
  }

  get clearSearchInput() {
    return this.hydrated.getByRole('button', {name: 'Clear'});
  }

  get showMore() {
    return this.page.getByLabel('Show more values for the Category facet');
  }

  get showLess() {
    return this.page.getByLabel('Show less values for the Category facet');
  }

  get allCategoryButton() {
    return this.hydrated.getByRole('button', {name: 'All Categories'});
  }

  getFacetValue(value: string) {
    return this.hydrated.getByLabel(`Inclusion filter on ${value};`);
  }

  getSearchResult(value: string) {
    return this.hydrated
      .locator('[part="search-results"]')
      .locator('li')
      .getByTitle(value);
  }
}
