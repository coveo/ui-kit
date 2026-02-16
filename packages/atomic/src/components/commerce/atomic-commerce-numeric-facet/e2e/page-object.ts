import type {Page} from '@playwright/test';
import {AnyFacetPageObject} from '@/src/components/common/facets/e2e/page-object';

export class NumericFacetPageObject extends AnyFacetPageObject<'atomic-commerce-numeric-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-commerce-numeric-facet');
  }

  get title() {
    return this.page.getByText('Price');
  }

  get hydrated() {
    return this.page.locator('atomic-commerce-numeric-facet[field="ec_price"]');
  }

  getFacetValueByPosition(position: number) {
    return this.hydrated.getByRole('listitem').nth(position);
  }

  getFacetValueButtonByPosition(position: number) {
    return this.getFacetValueByPosition(position).locator('button');
  }

  getFacetValueButtonByLabel(start: string, end: string) {
    return this.page.getByLabel(`Inclusion filter on ${start} to ${end}`);
  }

  getFacetValueByRange(start: string, end: string) {
    return this.hydrated
      .getByRole('listitem')
      .filter({hasText: `${start} to ${end}`});
  }

  get clearFilter() {
    return this.hydrated.getByRole('button').filter({hasText: /Clear.*filter/});
  }

  get inputMinimum() {
    return this.hydrated.getByLabel('Enter a minimum numerical');
  }

  get inputMaximum() {
    return this.hydrated.getByLabel('Enter a maximum numerical');
  }

  get inputApply() {
    return this.hydrated.getByLabel('Apply custom numerical values');
  }
}
