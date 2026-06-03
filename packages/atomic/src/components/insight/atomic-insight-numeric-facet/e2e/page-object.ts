import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightNumericFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-numeric-facet');
  }

  get facet() {
    return this.page.locator('[part="facet"]');
  }

  get facetValues() {
    return this.facet.locator('[part="value-checkbox"]');
  }

  get selectedCheckboxes() {
    return this.facet.locator('[part~="value-checkbox-checked"]');
  }

  get facetValueLabels() {
    return this.facet.locator('[part="value-label"]');
  }

  get facetLinkValues() {
    return this.facet.locator('[part="value-link"]');
  }

  get clearButton() {
    return this.facet.locator('[part="clear-button"]');
  }

  get labelButton() {
    return this.page.locator('[part="label-button"]').first();
  }

  get valuesContainer() {
    return this.facet.locator('[part="values"]');
  }

  get minInput() {
    return this.facet.locator('[part="input-start"]');
  }

  get maxInput() {
    return this.facet.locator('[part="input-end"]');
  }

  get applyButton() {
    return this.facet.locator('[part="input-apply-button"]');
  }
}
