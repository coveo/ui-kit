import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicAutomaticFacetGeneratorPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-automatic-facet-generator');
  }

  get automaticFacets() {
    return this.page.locator('atomic-automatic-facet');
  }

  get placeholders() {
    return this.page.locator('[part="placeholder"]');
  }

  getAutomaticFacet(index: number) {
    return this.automaticFacets.nth(index);
  }

  getFacetLabel(index: number) {
    return this.getAutomaticFacet(index).locator('[part="label-button"]');
  }
}
