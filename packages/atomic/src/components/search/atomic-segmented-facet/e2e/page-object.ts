import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class SegmentedFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-segmented-facet');
  }

  get segmentedContainer() {
    return this.hydrated.locator('[part="segmented-container"]');
  }

  get label() {
    return this.hydrated.locator('[part="label"]');
  }

  get valueBoxes() {
    return this.hydrated.locator('[part="value-box"]');
  }
}
