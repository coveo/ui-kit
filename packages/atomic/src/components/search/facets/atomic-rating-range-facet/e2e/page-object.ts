import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

export class RatingRangeFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-rating-range-facet');
  }

  get facetLabel(): Locator {
    return this.page.locator(
      'atomic-rating-range-facet button[part="label-button"]'
    );
  }

  get clearButton(): Locator {
    return this.page.locator(
      'atomic-rating-range-facet button[part="clear-button"]'
    );
  }

  get values(): Locator {
    return this.page.locator('atomic-rating-range-facet [part="values"]');
  }

  valueLink(index: number): Locator {
    return this.page
      .locator(`atomic-rating-range-facet [part="value-link"]`)
      .nth(index);
  }

  get selectedValues(): Locator {
    return this.page.locator(
      'atomic-rating-range-facet [part="value-link-selected"]'
    );
  }

  get ratingIcons(): Locator {
    return this.page.locator(
      'atomic-rating-range-facet [part="value-rating-icon"]'
    );
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
