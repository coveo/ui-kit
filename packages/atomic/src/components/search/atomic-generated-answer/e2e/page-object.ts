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

  get citationPopover() {
    return this.page.locator('atomic-citation [part="citation-popover"]');
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

  get likeButton() {
    return this.page.locator('button[part="feedback-button"].like');
  }

  get dislikeButton() {
    return this.page.locator('button[part="feedback-button"].dislike');
  }

  get feedbackModal() {
    return this.page.locator('atomic-generated-answer-feedback-modal');
  }

  get feedbackModalSubmitButton() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] button[type="submit"]'
    );
  }

  get feedbackModalSkipButton() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] button[type="button"]'
    );
  }

  get feedbackModalCloseButton() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] button[part^="close"]'
    );
  }

  get feedbackModalOptions() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] input[type="radio"]'
    );
  }

  get feedbackModalCorrectAnswerInput() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] input[type="text"][placeholder="https://URL"]'
    );
  }

  get feedbackModalAdditionalNotesInput() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] textarea[name="answer-details"]'
    );
  }

  get feedbackModalSuccessMessage() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] atomic-icon'
    );
  }

  get correctTopicOptions() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] .correctTopic input[type="radio"]'
    );
  }

  get hallucinationFreeOptions() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] .hallucinationFree input[type="radio"]'
    );
  }

  get documentedOptions() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] .documented input[type="radio"]'
    );
  }

  get readableOptions() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] .readable input[type="radio"]'
    );
  }

  async selectOption(
    questionType:
      | 'correctTopic'
      | 'hallucinationFree'
      | 'documented'
      | 'readable',
    option: 'yes' | 'unknown' | 'no'
  ) {
    const selector = `atomic-generated-answer-feedback-modal[is-open] .${questionType} input[type="radio"][value="${option === 'unknown' ? 'Not sure' : option === 'yes' ? 'Yes' : 'No'}"]`;
    await this.page.locator(selector).click();
  }

  // Method to fill all required feedback options
  async fillAllRequiredOptions() {
    await this.selectOption('correctTopic', 'yes');
    await this.selectOption('hallucinationFree', 'yes');
    await this.selectOption('documented', 'yes');
    await this.selectOption('readable', 'yes');
  }

  // Method to check if modal is open
  async isModalOpen(): Promise<boolean> {
    const modal = this.feedbackModal;
    return await modal.isVisible();
  }

  // Method to wait for modal to be visible
  async waitForModal() {
    await this.page
      .locator('atomic-modal[part="generated-answer-feedback-modal"]')
      .waitFor();
  }

  // Method to wait for modal to be hidden
  async waitForModalToClose() {
    const modal = this.page.locator(
      'atomic-modal[part="generated-answer-feedback-modal"]'
    );
    await modal.waitFor({state: 'hidden'});
  }

  async waitForLikeAndDislikeButtons() {
    await this.likeButton.waitFor();
    await this.dislikeButton.waitFor();
  }

  // Method to check if validation errors are shown
  get validationErrors() {
    return this.page.locator(
      'atomic-generated-answer-feedback-modal[is-open] .required'
    );
  }
}
