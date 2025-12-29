import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

export class SmartSnippetPageObject extends BasePageObject {
  constructor(page: Page) {
    super(page, 'atomic-smart-snippet');
  }

  get smartSnippet() {
    return this.hydrated;
  }

  get question() {
    return this.hydrated.locator('[part~="question"]');
  }

  get answer() {
    return this.hydrated.locator('[part~="answer"]');
  }

  get truncatedAnswer() {
    return this.hydrated.locator('[part~="truncated-answer"]');
  }

  get body() {
    return this.hydrated.locator('[part~="body"]');
  }

  get footer() {
    return this.hydrated.locator('[part~="footer"]');
  }

  get source() {
    return this.hydrated.locator('atomic-smart-snippet-source');
  }

  get sourceUrl() {
    return this.hydrated.locator('[part~="source-url"]');
  }

  get sourceTitle() {
    return this.hydrated.locator('[part~="source-title"]');
  }

  get feedbackBanner() {
    return this.hydrated.locator('[part~="feedback-banner"]');
  }

  get feedbackInquiry() {
    return this.hydrated.locator('[part~="feedback-inquiry"]');
  }

  get feedbackLikeButton() {
    return this.hydrated.locator('[part~="feedback-like-button"]');
  }

  get feedbackDislikeButton() {
    return this.hydrated.locator('[part~="feedback-dislike-button"]');
  }

  get feedbackExplainWhyButton() {
    return this.hydrated.locator('[part~="feedback-explain-why-button"]');
  }

  get feedbackThankYou() {
    return this.hydrated.locator('[part~="feedback-thank-you"]');
  }

  get expandableAnswer() {
    return this.hydrated.locator('atomic-smart-snippet-expandable-answer');
  }

  get showMoreButton() {
    return this.hydrated.locator('[part~="show-more-button"]');
  }

  get showLessButton() {
    return this.hydrated.locator('[part~="show-less-button"]');
  }

  get inlineLinks() {
    return this.hydrated.locator('a');
  }

  async clickLikeButton() {
    await this.feedbackLikeButton.click();
  }

  async clickDislikeButton() {
    await this.feedbackDislikeButton.click();
  }

  async clickExplainWhyButton() {
    await this.feedbackExplainWhyButton.click();
  }

  async clickShowMoreButton() {
    await this.showMoreButton.click();
  }

  async clickShowLessButton() {
    await this.showLessButton.click();
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
