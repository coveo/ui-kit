import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaClickEvent,
  isUaCustomEvent,
} from '../../../../../../playwright/utils/requests';

const minimumCitationTooltipDisplayDurationMs = 1500;

export class GeneratedAnswerObject {
  constructor(
    public page: Page,
    public streamId: string
  ) {
    this.page = page;
    this.streamId = streamId;
  }

  get likeButton(): Locator {
    return this.page.locator('[data-cy="feedback__like-button"]');
  }

  get dislikeButton(): Locator {
    return this.page.locator('[data-cy="feedback__dislike-button"]');
  }

  get copyToClipboardButton(): Locator {
    return this.page.locator(
      '[data-test="generated-answer__copy-to-clipboard"]'
    );
  }

  get toggleButton(): Locator {
    return this.page.locator('[data-test="generated-answer__toggle-button"]');
  }

  feedbackOption(value: string, index: number): Locator {
    return this.page
      .locator('.feedback-modal-qna__question input', {
        has: this.page.locator(`[value="${value}"]`),
      })
      .nth(index);
  }

  questionContainer(questionText: string): Locator {
    return this.page.locator('.feedback-modal-qna__question', {
      hasText: questionText,
    });
  }

  get feedbackDocumentUrlInput(): Locator {
    return this.page.locator(
      '.feedback-modal-qna__body input[name="documentUrl"]'
    );
  }

  get feedbackDetailsInput(): Locator {
    return this.page.locator(
      '.feedback-modal-qna__body [data-name="details"] textarea'
    );
  }

  get submitFeedbackButton(): Locator {
    return this.page.getByRole('button', {name: /Send feedback/i});
  }

  get citationLink(): Locator {
    return this.page.locator(
      '[data-test="generated-answer__citations"] .citation__link'
    );
  }

  async hoverOverCitation(index: number): Promise<void> {
    // waiting 500ms to allow the component to render completely, cause any re-rendering abort the hover action.
    await this.page.waitForTimeout(500);
    await this.citationLink.waitFor({state: 'visible'});
    await this.citationLink.nth(index).hover();
    await this.page.waitForTimeout(minimumCitationTooltipDisplayDurationMs);
    await this.page.mouse.move(0, 0);
  }

  async clickOnCitation(index: number): Promise<void> {
    await this.citationLink.nth(index).click();
  }

  async typeInFeedbackDocumentUrlInput(text: string): Promise<void> {
    await this.feedbackDocumentUrlInput.fill(text);
  }

  async typeInFeedbackDetailsInput(text: string): Promise<void> {
    await this.feedbackDetailsInput.fill(text);
  }

  async clickSubmitFeedbackButton(): Promise<void> {
    await this.submitFeedbackButton.click();
  }

  answerOption(questionText: string, answerValue: string): Locator {
    return this.questionContainer(questionText).locator('.slds-radio_button', {
      hasText: new RegExp(`^${answerValue}$`),
    });
  }

  async fillFeedbackForm(answers: Record<string, string>): Promise<void> {
    for (const [questionText, answerValue] of Object.entries(answers)) {
      const option = this.answerOption(questionText, answerValue);
      // eslint-disable-next-line no-await-in-loop
      await option.click();
    }
  }

  async clickLikeButton(): Promise<void> {
    await this.likeButton.click();
  }

  async clickDislikeButton(): Promise<void> {
    await this.dislikeButton.click();
  }

  async clickCopyToClipboardButton(): Promise<void> {
    await this.copyToClipboardButton.click();
  }

  async clickToggleButton(): Promise<void> {
    await this.toggleButton.click();
  }

  async clickFeedbackOption(value: string, index: number): Promise<void> {
    await this.feedbackOption(value, index).click();
  }

  async mockStreamResponse(
    body: Array<{payloadType: string; payload: string; finishReason?: string}>
  ) {
    await this.page.route(
      `**/machinelearning/streaming/${this.streamId}`,
      (route) => {
        let bodyText = '';
        body.forEach((data) => {
          bodyText += `data: ${JSON.stringify(data)} \n\n`;
        });

        route.fulfill({
          status: 200,
          body: bodyText,
          headers: {
            'content-type': 'text/event-stream',
          },
        });
      }
    );
  }

  async waitForGeneratedAnswerUaAnalytics(
    eventValue,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventType: 'generatedAnswer',
          eventValue: eventValue,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        const customData = requestBody?.customData;

        const matchesGenerativeId =
          customData?.generativeQuestionAnsweringId === this.streamId;

        return (
          matchesExpectedFields &&
          matchesGenerativeId &&
          (customChecker ? customChecker(customData) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForStreamEndUaAnalytics(): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics('generatedAnswerStreamEnd');
  }

  async waitForLikeGeneratedAnswerUaAnalytics(): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics('likeGeneratedAnswer');
  }

  async waitForDislikeGeneratedAnswerUaAnalytics(): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics('dislikeGeneratedAnswer');
  }

  async waitForCopyToClipboardUaAnalytics(): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics(
      'generatedAnswerCopyToClipboard'
    );
  }

  async waitForShowAnswersUaAnalytics(): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics('generatedAnswerShowAnswers');
  }

  async waitForHideAnswersUaAnalytics(): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics('generatedAnswerHideAnswers');
  }

  async waitForSourceHoverUaAnalytics(
    expectedFields: object
  ): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics(
      'generatedAnswerSourceHover',
      (customData: object) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForFeedbackSubmitUaAnalytics(
    expectedFields: object
  ): Promise<Request> {
    return this.waitForGeneratedAnswerUaAnalytics(
      'generatedAnswerFeedbackSubmitV2',
      (customData: object) => {
        return Object.keys(expectedFields).every(
          (key) => customData?.[key] === expectedFields[key]
        );
      }
    );
  }

  async waitForCitationClickUaAnalytics(
    expectedFields: object,
    expectedCustomFields: object
  ): Promise<Request> {
    return this.waitForGeneratedAnswerClickUaAnalytics(
      'generatedAnswerCitationClick',
      (data: object, customData: object) => {
        return (
          Object.keys(expectedFields).every(
            (key) => data?.[key] === expectedFields[key]
          ) &&
          Object.keys(expectedCustomFields).every(
            (key) => customData?.[key] === expectedCustomFields[key]
          )
        );
      }
    );
  }

  async waitForGeneratedAnswerClickUaAnalytics(
    actionCause: string,
    customChecker?: Function
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const requestData = JSON.parse(requestBody.clickEvent);
        const expectedFields = {
          actionCause,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestData?.[key] === expectedFields[key]
        );

        const customData = requestData?.customData;

        const matchesGenerativeId =
          customData?.generativeQuestionAnsweringId === this.streamId;

        return (
          matchesExpectedFields &&
          matchesGenerativeId &&
          (customChecker ? customChecker(requestData, customData) : true)
        );
      }
      return false;
    });
    return uaRequest;
  }
}
