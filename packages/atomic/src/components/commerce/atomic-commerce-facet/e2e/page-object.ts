import type {Page} from '@playwright/test';
import {AnyFacetPageObject} from '../../e2e/page-object';

export class FacetPageObject extends AnyFacetPageObject<'atomic-commerce-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-facet');
  }

  get title() {
    return this.page.getByText('Brand');
  }

  getFacetValueButtonByPosition(valuePosition: number) {
    const value = this.getFacetValueByPosition(valuePosition);
    return value.locator('button');
  }

  getFacetValueByPosition(valuePosition: number) {
    return this.page.getByRole('listitem').nth(valuePosition);
  }

  getFacetValueByLabel(value: string | RegExp) {
    return this.page.getByRole('listitem').filter({hasText: value});
  }

  getFacetValueButtonByLabel(value: string | RegExp) {
    return this.page.getByLabel(`Inclusion filter on ${value}`);
  }

  get clearFilter() {
    return this.page.getByRole('button').filter({hasText: /Clear.*filter/});
  }
}
