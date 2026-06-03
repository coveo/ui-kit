import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightTimeframeFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-timeframe-facet');
  }

  get facet() {
    return this.page.locator('[part="facet"]');
  }

  get labelButton() {
    return this.page.locator('[part="label-button"]').first();
  }

  get clearButton() {
    return this.facet.locator('[part="clear-button"]');
  }

  get valuesContainer() {
    return this.facet.locator('[part="values"]');
  }

  get facetValues() {
    return this.facet.locator('[part~="value-link"]');
  }

  get selectedValues() {
    return this.facet.locator('[part~="value-link-selected"]');
  }
}
