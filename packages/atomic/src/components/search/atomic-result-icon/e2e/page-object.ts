import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class ResultIconPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-result-icon');
  }

  get svg() {
    return this.hydrated.locator('svg');
  }

  get atomicIcon() {
    return this.hydrated.locator('atomic-icon');
  }

  /**
   * Wait for component to be stable before screenshot
   */
  async waitForVisualStability() {
    await this.hydrated.waitFor();
    await this.page.waitForTimeout(500);
    await this.page.evaluate(() => document.fonts.ready);
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
