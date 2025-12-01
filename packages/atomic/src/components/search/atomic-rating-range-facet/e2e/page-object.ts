import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RatingRangeFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-rating-range-facet');
  }

  valueLink(index: number): Locator {
    return this.hydrated.locator(`[part="value-link"]`).nth(index);
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
