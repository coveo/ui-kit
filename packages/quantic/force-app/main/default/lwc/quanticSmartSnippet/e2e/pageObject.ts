import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaClickEvent,
  isUaCustomEvent,
} from '../../../../../../playwright/utils/requests';

export class SmartSnippetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  get smartSnippet(): Locator {
    return this.page.locator('c-quantic-smart-snippet');
  }

  get smartSnippetSourceTitle(): Locator {
    return this.page.getByTestId('smart-snippet__source-title');
  }

  get smartSnippetSourceUri(): Locator {
    return this.page.getByTestId('smart-snippet__source-uri');
  }

  get smartSnippetAnwerInlineLink(): Locator {
    return this.page.locator('[data-testid="smart-snippet-answer"] > a');
  }

  get smartSnippetToggleButton(): Locator {
    return this.page.getByTestId('smart-snippet__toggle-button');
  }

  get likeButton(): Locator {
    return this.page.getByTestId('feedback__like-button');
  }

  get dislikeButton(): Locator {
    return this.page.getByTestId('feedback__dislike-button');
  }

  get explainWhyButton(): Locator {
    return this.page.getByTestId('feedback__explain-why-button');
  }

  get feedbackModalCancelButton(): Locator {
    return this.page.getByTestId('feedback-modal-footer__cancel');
  }

  get feedbackModalDoneButton(): Locator {
    return this.page.getByTestId('feedback-modal-footer__done');
  }

  get firstFeedbackOptionLabel(): Locator {
    const labelFirstOption = "Didn't answer my question at all";
    return this.page.getByText(labelFirstOption);
  }

  get feedbackSubmitButton(): Locator {
    return this.page.getByTestId('feedback-modal-footer__submit');
  }

  async clickToggleButton(): Promise<void> {
    await this.smartSnippetToggleButton.click();
  }

  async clickOnSourceTitle(): Promise<void> {
    await this.smartSnippetSourceTitle.click();
  }

  async clickOnSourceUri(): Promise<void> {
    await this.smartSnippetSourceUri.click();
  }

  async clickOnFirstInlineLink(): Promise<void> {
    await this.smartSnippetAnwerInlineLink.first().click();
  }

  async clickLikeButton(): Promise<void> {
    await this.likeButton.click();
  }

  async clickDislikeButton(): Promise<void> {
    await this.dislikeButton.click();
  }

  async clickExplainWhyButton(): Promise<void> {
    await this.explainWhyButton.click();
  }

  async clickFeedbackModalCancelButton(): Promise<void> {
    await this.feedbackModalCancelButton.click();
  }

  async selectFirstFeedbackOptionLabel(): Promise<void> {
    await this.firstFeedbackOptionLabel.click({force: true});
  }

  async clickFeedbackSubmitButton(): Promise<void> {
    await this.feedbackSubmitButton.click();
  }

  async clickFeedbackModalDoneButton(): Promise<void> {
    await this.feedbackModalDoneButton.click();
  }

  async waitForExpandSmartSnippetUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics('expandSmartSnippet');
  }

  async waitForCollapseSmartSnippetUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics('collapseSmartSnippet');
  }

  async waitForLikeSmartSnippetUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics('likeSmartSnippet');
  }

  async waitForDislikeSmartSnippetUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics('dislikeSmartSnippet');
  }

  async waitForOpenFeedbackModalUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics(
      'openSmartSnippetFeedbackModal'
    );
  }

  async waitForCloseFeedbackModalUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics(
      'closeSmartSnippetFeedbackModal'
    );
  }

  async waitForFeedbackSubmitUaAnalytics(
    expectedReason: string
  ): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics(
      'sendSmartSnippetReason',
      expectedReason
    );
  }

  async waitForSmartSnippetSourceClickUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetClickUaAnalytics('openSmartSnippetSource');
  }

  async waitForSmartSnippetInlineLinkClickUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetClickUaAnalytics(
      'openSmartSnippetInlineLink'
    );
  }

  async waitForSmartSnippetClickUaAnalytics(
    actionCause: string
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const requestData = JSON.parse(requestBody.clickEvent);

        const expectedFields: Record<string, any> = {
          actionCause,
        };

        return requestData?.actionCause === expectedFields.actionCause;
      }
      return false;
    });
    return uaRequest;
  }

  async waitForSmartSnippetCustomUaAnalytics(
    eventValue: any,
    reason?: string
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields: Record<string, any> = {
          eventType: 'smartSnippet',
          eventValue: eventValue,
        };

        const matchesExpectedFields = Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );

        const customData = requestBody?.customData;
        const matchesReason = customData?.reason === reason;

        return matchesExpectedFields && matchesReason;
      }
      return false;
    });
    return uaRequest;
  }
}
