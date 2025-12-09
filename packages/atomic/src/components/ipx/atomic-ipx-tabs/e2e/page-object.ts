import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

/**
 * Page object for atomic-ipx-tabs E2E tests
 */
export class IpxTabsPageObject extends BasePageObject<'atomic-ipx-tabs'> {
  constructor(page: Page) {
    super(page, 'atomic-ipx-tabs');
  }

  /**
   * Wait for component to be stable before taking screenshots.
   */
  async waitForVisualStability(): Promise<void> {
    await this.hydrated.waitFor();
    await this.page.evaluate(() => document.fonts.ready);
  }

  /**
   * Capture a screenshot of the component for visual regression testing.
   */
  async captureScreenshot(options?: {
    animations?: 'disabled' | 'allow';
  }): Promise<Buffer> {
    await this.waitForVisualStability();
    return await this.hydrated.screenshot({
      animations: options?.animations ?? 'disabled',
    });
  }

  get tabBar() {
    return this.page.locator('atomic-tab-bar');
  }
}
