import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class RatingRangeFacetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-rating-range-facet');
  }

  get facet(): Locator {
    return this.hydrated.locator(`[part="facet"]`);
  }

  get labelButton(): Locator {
    return this.hydrated.locator(`[part="label-button"]`);
  }

  get clearButton(): Locator {
    return this.hydrated.getByRole('button', {name: /clear.*filter/i});
  }

  get values(): Locator {
    return this.hydrated.locator(`[part="values"]`);
  }

  get valueLinks(): Locator {
    return this.hydrated.locator(`[part="value-link"]`);
  }

  get selectedValueLinks(): Locator {
    return this.hydrated.locator(`[part="value-link value-link-selected"]`);
  }

  get ratingIcons(): Locator {
    return this.hydrated.locator(`[part~="value-rating-icon"]`);
  }

  get placeholder(): Locator {
    return this.hydrated.locator(`[part="placeholder"]`);
  }

  valueLink(index: number): Locator {
    return this.valueLinks.nth(index);
  }

  getRatingValueByStars(stars: number): Locator {
    return this.hydrated.locator(
      `[part="value-link"]:has([aria-label*="${stars} star"])`
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
