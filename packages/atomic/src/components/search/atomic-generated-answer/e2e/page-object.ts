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

type FeedbackValue = 'Yes' | 'No' | 'Not Sure';

interface FeedbackParams {
  correctTopic?: FeedbackValue;
  hallucinationFree?: FeedbackValue;
  documented?: FeedbackValue;
  readable?: FeedbackValue;
}

const feedbackValueLabels: Record<FeedbackValue, string> = {
  Yes: 'Yes',
  No: 'No',
  'Not Sure': 'Not sure',
};

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
    return this.page.getByRole('button', {name: /^helpful$/i});
  }

  get dislikeButton() {
    return this.page.getByRole('button', {name: /^not helpful$/i});
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
    return this.feedbackModal.locator(
      'input[type="text"][placeholder="https://URL"]'
    );
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
    const feedbackLabelHtmlValue = feedbackValueLabels[option];
    const selector = `.${questionType} input[type="radio"][value="${feedbackLabelHtmlValue}"]`;
    await this.feedbackModal.locator(selector).click();
  }

  async fillAllRequiredOptions(params?: FeedbackParams) {
    await this.selectOption('correctTopic', params?.correctTopic ?? 'Yes');
    await this.selectOption(
      'hallucinationFree',
      params?.hallucinationFree ?? 'Yes'
    );
    await this.selectOption('documented', params?.documented ?? 'Yes');
    await this.selectOption('readable', params?.readable ?? 'Yes');
  }

  async waitForModalToOpen() {
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

  get validationErrors() {
    return this.feedbackModal.getByText('This field is required.');
  }

  async waitForEvaluationRequest(expectedHelpful: boolean) {
    const evaluationRequest = await this.page.waitForRequest((request) => {
      if (
        request.method() === 'POST' &&
        /\/rest\/organizations\/.*\/answer\/v1\/configs\/.*\/evaluations/.test(
          request.url()
        )
      ) {
        const body = request.postDataJSON();
        return body?.helpful === expectedHelpful;
      }
      return false;
    });

    return evaluationRequest;
  }

  async waitForAnalyticsRequest() {
    const analyticsRequest = await this.page.waitForRequest((request) => {
      if (
        request.method() === 'POST' &&
        /\/rest\/organizations\/.*\/events\/v1/.test(request.url())
      ) {
        return true;
      }
      return false;
    });

    return analyticsRequest;
  }
}
