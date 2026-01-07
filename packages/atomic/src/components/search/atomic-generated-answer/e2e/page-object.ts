import type {GeneratedAnswerCitation} from '@coveo/headless';
import type {Page} from '@playwright/test';
import {BasePageObject} from '@/playwright-utils/lit-base-page-object';

interface AtomicCitationElement extends HTMLElement {
  citation?: GeneratedAnswerCitation;
}

type FeedbackQuestion =
  | 'correctTopic'
  | 'hallucinationFree'
  | 'documented'
  | 'readable';

type FeedbackValue = 'yes' | 'no' | 'not_sure';

interface FeedbackParams {
  correctTopic?: FeedbackValue;
  hallucinationFree?: FeedbackValue;
  documented?: FeedbackValue;
  readable?: FeedbackValue;
}

export class GeneratedAnswerPageObject extends BasePageObject {
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
    return this.feedbackModal.locator('button[part="submit-button"]');
  }

  get feedbackModalSkipButton() {
    return this.feedbackModal.locator('button[part="cancel-button"]');
  }

  get feedbackModalCorrectAnswerInput() {
    return this.feedbackModal.getByRole('textbox', {
      name: 'Link to correct answer',
    });
  }

  get feedbackModalAdditionalNotesInput() {
    return this.feedbackModal.locator('textarea[name="answer-details"]');
  }

  get feedbackModalSuccessMessage() {
    return this.feedbackModal.getByText(
      'Thank you! Your feedback will help us improve the answers generated.'
    );
  }

  get feedbackModalSuccessMessageDoneButton() {
    return this.feedbackModal
      .locator('button[part="cancel-button"]')
      .filter({hasText: 'Done'});
  }

  async selectOption(questionType: FeedbackQuestion, option: FeedbackValue) {
    const value =
      option === 'not_sure' ? 'Not sure' : option === 'yes' ? 'Yes' : 'No';
    const selector = `.${questionType} input[type="radio"][value="${value}"]`;
    await this.feedbackModal.locator(selector).click();
  }

  async fillAllRequiredOptions(params?: FeedbackParams) {
    await this.selectOption('correctTopic', params?.correctTopic ?? 'yes');
    await this.selectOption(
      'hallucinationFree',
      params?.hallucinationFree ?? 'yes'
    );
    await this.selectOption('documented', params?.documented ?? 'yes');
    await this.selectOption('readable', params?.readable ?? 'yes');
  }

  async waitForModal() {
    await this.feedbackModal.waitFor({state: 'attached'});
    await this.page.waitForFunction(() => {
      const modal = document.querySelector(
        'atomic-generated-answer-feedback-modal'
      );
      return modal?.hasAttribute('is-open');
    });
  }

  async waitForModalToClose() {
    await this.page.waitForFunction(() => {
      const modal = document.querySelector(
        'atomic-generated-answer-feedback-modal'
      );
      return !modal?.hasAttribute('is-open');
    });
  }

  async waitForLikeAndDislikeButtons() {
    await this.likeButton.waitFor({state: 'visible'});
    await this.dislikeButton.waitFor({state: 'visible'});
  }

  get validationErrors() {
    return this.feedbackModal.getByText('This field is required.');
  }

  async waitForEvaluationRequest(expectedHelpful: boolean) {
    const rgaEvaluationsRequestRegex =
      /\/rest\/organizations\/.*\/answer\/v1\/configs\/.*\/evaluations/;

    const evaluationRequest = await this.page.waitForRequest((request) => {
      if (
        request.method() === 'POST' &&
        rgaEvaluationsRequestRegex.test(request.url())
      ) {
        const body = request.postDataJSON();
        return body?.helpful === expectedHelpful;
      }
      return false;
    });

    return evaluationRequest;
  }
}
