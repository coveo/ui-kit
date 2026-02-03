import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

/**
 * Page object for atomic-insight-result-attach-to-case-action E2E tests
 */
export class AtomicInsightResultAttachToCaseActionPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-attach-to-case-action');
  }

  /**
   * Wait for component to be stable before taking screenshots.
   */
  async waitForVisualStability(): Promise<void> {
    await this.hydrated.first().waitFor();
    await this.page.evaluate(() => document.fonts.ready);
  }

  /**
   * Capture a screenshot of the component for visual regression testing.
   */
  async captureScreenshot(options?: {
    animations?: 'disabled' | 'allow';
  }): Promise<Buffer> {
    await this.waitForVisualStability();
    return await this.hydrated
      .first()
      .screenshot({animations: options?.animations ?? 'disabled'});
  }

  get actionButton() {
    return this.page.locator('[part="result-action-button"]');
  }

  get actionIcon() {
    return this.page.locator('[part="result-action-icon"]');
  }
}
