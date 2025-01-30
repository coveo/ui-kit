import {Page} from '@playwright/test';
import {BasePageObject} from '../../../../../../playwright-utils/base-page-object';

export class AtomicNumericFacetPageObject extends BasePageObject<'atomic-numeric-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-numeric-facet');
  }

  get facetInputStart() {
    return this.page.getByLabel('Enter a minimum numerical value');
  }

  get facetInputEnd() {
    return this.page.getByLabel('Enter a maximum numerical value');
  }

  get facetApplyButton() {
    return this.page.getByLabel('Apply custom numerical values');
  }

  get facetClearFilter() {
    return this.page.getByRole('button').filter({hasText: 'Clear filter'});
  }

  get getFacetValue() {
    return this.page.locator('[part="value-checkbox"]');
  }
}
