import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class AtomicInsightResultQuickviewActionLocators extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-insight-result-quickview-action');
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

  get resultButton() {
    return this.page.getByRole('button', {name: 'Quick View'});
  }

  get modal() {
    return this.page.getByRole('dialog');
  }

  get modalContainer() {
    return this.modal.locator('article');
  }

  get keywordsHighlight() {
    return this.page.getByText('Keywords highlight');
  }

  get keywordNavigatorNext() {
    return this.page.getByLabel('Next').first();
  }

  get keywordNavigatorPrevious() {
    return this.page.getByLabel('Previous').first();
  }

  get removeHighlights() {
    return this.page.getByLabel('Remove highlights').first();
  }

  get header() {
    return this.modal.locator('[part="header"]');
  }

  get titleLink() {
    return this.page.getByRole('link');
  }

  get closeButton() {
    return this.page.getByLabel('Close');
  }

  get pagerSummary() {
    return this.page.getByText('Result 1 of');
  }

  get nextQuickviewButton() {
    return this.page.getByRole('button', {name: 'Next quickview'});
  }

  get previousQuickviewButton() {
    return this.page.getByRole('button', {name: 'Previous quickview'});
  }

  get toggleKeywordNavigationButton() {
    return this.page.getByLabel('Toggle keywords navigation');
  }
}
