import type {Page} from '@playwright/test';
import {AnyFacetPageObject} from '../../e2e/page-object';

export class CategoryFacetPageObject extends AnyFacetPageObject<'atomic-commerce-category-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-category-facet');
  }

  get title() {
    return this.page.getByText('Category');
  }

  get allCategoryButton() {
    return this.page.getByRole('button', {name: 'All Categories'});
  }

  getFacetValue(value: string) {
    return this.page.getByLabel(`Inclusion filter on ${value};`);
  }
}
