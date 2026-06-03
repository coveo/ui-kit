import type {Locator, Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class PopoverPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-popover');
  }

  get popoverButton(): Locator {
    return this.page.locator('atomic-popover button[part="popover-button"]');
  }

  get backdrop(): Locator {
    return this.page.locator('atomic-popover [part="backdrop"]');
  }

  get facetContainer(): Locator {
    return this.page
      .locator('atomic-popover')
      .locator('[part="facet"]')
      .first();
  }

  get valueLabel(): Locator {
    return this.page.locator(
      'atomic-popover button[part="popover-button"] [part="value-label"]'
    );
  }

  get valueCount(): Locator {
    return this.page.locator(
      'atomic-popover button[part="popover-button"] [part="value-count"]'
    );
  }

  get placeholder(): Locator {
    return this.page.locator('atomic-popover [part="placeholder"]');
  }

  async waitForVisualStability() {
    await this.hydrated.waitFor();
    await this.page.waitForTimeout(500);
    await this.page.evaluate(() => document.fonts.ready);
    await this.page.waitForLoadState('networkidle');
  }

  async captureScreenshot(options?: {animations?: 'disabled' | 'allow'}) {
    await this.waitForVisualStability();

    const element = await this.component.elementHandle();
    if (!element) {
      throw new Error('Component element not found');
    }

    return await element.screenshot({
      animations: options?.animations ?? 'disabled',
    });
  }

  get component(): Locator {
    return this.hydrated;
  }
}
