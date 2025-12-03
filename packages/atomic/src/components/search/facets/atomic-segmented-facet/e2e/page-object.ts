import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class AtomicSegmentedFacetPageObject extends BasePageObject<'atomic-segmented-facet'> {
  constructor(page: Page) {
    super(page, 'atomic-segmented-facet');
  }

  get facet() {
    return this.page.locator('atomic-segmented-facet');
  }

  get label() {
    return this.facet.locator('[part="label"]');
  }

  get valuesContainer() {
    return this.facet.locator('[part="values"]');
  }

  get valueBoxes() {
    return this.facet.locator('[part~="value-box"]');
  }

  get selectedValueBox() {
    return this.facet.locator('[part~="value-box-selected"]');
  }

  get placeholder() {
    return this.facet.locator('[part="placeholder"]');
  }

  get segmentedContainer() {
    return this.facet.locator('[part="segmented-container"]');
  }

  valueAtIndex(index: number) {
    return this.valueBoxes.nth(index);
  }

  async waitForVisualStability() {
    await this.hydrated.waitFor();
    await this.page.waitForTimeout(500);
    await this.page.evaluate(() => document.fonts.ready);
    await this.page.waitForLoadState('networkidle');
  }

  async captureScreenshot(options?: {animations?: 'disabled' | 'allow'}) {
    await this.waitForVisualStability();

    const element = await this.facet.elementHandle();
    if (!element) {
      throw new Error('Component element not found');
    }

    return await element.screenshot({
      animations: options?.animations ?? 'disabled',
    });
  }
}
