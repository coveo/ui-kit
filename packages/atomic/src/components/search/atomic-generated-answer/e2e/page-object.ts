import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/base-page-object';

interface AtomicCitationElement extends HTMLElement {
  citation?: GeneratedAnswerCitation;
}

export class GeneratedAnswerPageObject extends BasePageObject<'atomic-generated-answer'> {
  constructor(page: Page) {
    super(page, 'atomic-generated-answer');
  }

  get citationComponents() {
    return this.page.locator('atomic-citation');
  }

  get citation() {
    return this.page.locator('atomic-citation [part="citation"]');
  }

  get generatedText() {
    return this.page.locator('atomic-generated-answer [part="generated-text"]');
  }

  get likeButton() {
    return this.page
      .locator('atomic-generated-answer [part="feedback-button"].like')
      .first();
  }

  get dislikeButton() {
    return this.page
      .locator('atomic-generated-answer [part="feedback-button"].dislike')
      .first();
  }

  get feedbackModal() {
    return this.page.locator('atomic-generated-answer-feedback-modal');
  }

  get feedbackSubmitButton() {
    return this.feedbackModal.getByRole('button', {name: /submit/i});
  }

  get feedbackCancelButton() {
    return this.feedbackModal.getByRole('button', {name: /cancel/i});
  }

  async waitForCitations() {
    await this.citation.first().waitFor();
  }

  async getCitationCount(): Promise<number> {
    return await this.citation.count();
  }

  async getCitationHref(index: number = 0): Promise<string | null> {
    return await this.citation.nth(index).getAttribute('href');
  }

  async getCitationFiletype(index: number = 0): Promise<string | null> {
    const citationComponent = this.citationComponents.nth(index);

    return await citationComponent.evaluate((citationElement) => {
      return (
        (citationElement as AtomicCitationElement).citation?.fields?.filetype ??
        null
      );
    });
  }

  async waitForGeneratedText() {
    await this.generatedText.first().waitFor({state: 'visible'});
  }

  async clickLikeButton() {
    await this.likeButton.click();
  }

  async clickDislikeButton() {
    await this.dislikeButton.click();
  }

  async isLikeButtonActive(): Promise<boolean> {
    const ariaPressed = await this.likeButton.getAttribute('aria-pressed');
    return ariaPressed === 'true';
  }

  async isDislikeButtonActive(): Promise<boolean> {
    const ariaPressed = await this.dislikeButton.getAttribute('aria-pressed');
    return ariaPressed === 'true';
  }

  async waitForFeedbackModal() {
    await this.feedbackModal.waitFor({state: 'visible'});
  }

  async isFeedbackModalOpen(): Promise<boolean> {
    return await this.feedbackModal.isVisible();
  }

  async submitFeedback() {
    await this.feedbackSubmitButton.click();
  }

  async cancelFeedback() {
    await this.feedbackCancelButton.click();
  }

  async fillFeedbackForm(options?: {
    correctTopic?: 'yes' | 'unknown' | 'no';
    hallucinationFree?: 'yes' | 'unknown' | 'no';
    documented?: 'yes' | 'unknown' | 'no';
    readable?: 'yes' | 'unknown' | 'no';
    documentUrl?: string;
    details?: string;
  }) {
    const {
      correctTopic = 'yes',
      hallucinationFree = 'yes',
      documented = 'yes',
      readable = 'yes',
      documentUrl,
      details,
    } = options || {};

    // Click radio buttons for each evaluation question
    await this.feedbackModal
      .locator(`.answer-evaluation.correctTopic`)
      .getByRole('radio', {name: correctTopic})
      .click();

    await this.feedbackModal
      .locator(`.answer-evaluation.hallucinationFree`)
      .getByRole('radio', {name: hallucinationFree})
      .click();

    await this.feedbackModal
      .locator(`.answer-evaluation.documented`)
      .getByRole('radio', {name: documented})
      .click();

    await this.feedbackModal
      .locator(`.answer-evaluation.readable`)
      .getByRole('radio', {name: readable})
      .click();

    // Fill optional fields if provided
    if (documentUrl) {
      await this.feedbackModal
        .locator('input[placeholder="https://URL"]')
        .fill(documentUrl);
    }

    if (details) {
      await this.feedbackModal.locator('textarea').fill(details);
    }
  }
}
