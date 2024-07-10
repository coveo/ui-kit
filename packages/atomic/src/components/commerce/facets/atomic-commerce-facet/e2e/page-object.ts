import type {Page} from '@playwright/test';
import {AnyFacetPageObject} from '../../e2e/page-object';

export class FacetPageObject extends AnyFacetPageObject<'atomic-commerce-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-facet');
  }

  get title() {
    return this.page.getByText('Brand');
  }

  getFacetValueButton(value: string) {
    return this.page.getByLabel(`Inclusion filter on ${value}`);
  }

  getFacetValue(value: string | RegExp) {
    return this.page.getByRole('listitem').filter({hasText: value});
  }

  get clearFilter() {
    return this.page.getByRole('button').filter({hasText: /Clear.*filter/});
  }
}
