import type {Page} from '@playwright/test';
import {AnyFacetPageObject} from '../../e2e/page-object';

export class NumericFacetPageObject extends AnyFacetPageObject<'atomic-commerce-numeric-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-numeric-facet');
  }

  get title() {
    return this.page.getByText('Price');
  }

  getFacetValueByPosition(position: number) {
    return this.page.getByRole('listitem').nth(position);
  }

  getFacetValueButtonByPosition(position: number) {
    return this.getFacetValueByPosition(position).locator('button');
  }

  getFacetValueButtonByLabel(start: string, end: string) {
    return this.page.getByLabel(`Inclusion filter on ${start} to ${end}`);
  }

  getFacetValueByRange(start: string, end: string) {
    return this.page
      .getByRole('listitem')
      .filter({hasText: `${start} to ${end}`});
  }

  get clearFilter() {
    return this.page.getByRole('button').filter({hasText: /Clear.*filter/});
  }

  get inputMinimum() {
    return this.page.getByLabel('Enter a minimum numerical');
  }

  get inputMaximum() {
    return this.page.getByLabel('Enter a maximum numerical');
  }

  get inputApply() {
    return this.page.getByLabel('Apply custom numerical values');
  }
}
