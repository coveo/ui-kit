import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicRatingFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-rating-facet');
  }

  getFacetValueByPosition(valuePosition: number) {
    return this.facetValues.nth(valuePosition);
  }

  getFacetValueButtonByPosition(valuePosition: number) {
    const value = this.getFacetValueByPosition(valuePosition);
    return value.locator('button');
  }

  get clearFilter() {
    return this.page.getByRole('button').filter({hasText: /Clear.*filter/});
  }

  get getSelectedFacetValueLink() {
    return this.page.locator('[part="value-link value-link-selected"]');
  }

  get getSelectedFacetValueBox() {
    return this.page.locator('[part="value-checkbox value-checkbox-checked"]');
  }

  get facetValues() {
    return this.page.getByRole('listitem');
  }

  /**
   * Wait for component to be stable before screenshot
   */
  async waitForVisualStability() {
    await this.hydrated.waitFor();
    await this.page.waitForTimeout(500); // Wait for animations
    await this.page.evaluate(() => document.fonts.ready); // Wait for fonts
    await this.page.waitForLoadState('networkidle');
  }

  async captureScreenshot(options?: {animations?: 'disabled' | 'allow'}) {
    await this.waitForVisualStability();

    const element = await this.hydrated.elementHandle();
    if (!element) {
      throw new Error('Component element not found');
    }

    return await element.screenshot({
      animations: options?.animations ?? 'disabled',
    });
  }
}
