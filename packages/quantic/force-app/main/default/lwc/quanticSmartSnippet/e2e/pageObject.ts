import type {Locator, Page, Request} from '@playwright/test';
import {
  isUaClickEvent,
  isUaCustomEvent,
} from '../../../../../../playwright/utils/requests';

export class SmartSnippetObject {
  constructor(public page: Page) {
    this.page = page;
  }

  // LOCATORS
  get smartSnippet(): Locator {
    return this.page.locator('c-quantic-smart-snippet');
  }

  get smartSnippetSourceTitle(): Locator {
    return this.page.getByTestId('smart-snippet__source-title');
  }

  get smartSnippetToggleButton(): Locator {
    return this.page.getByTestId('smart-snippet__toggle-button');
  }

  get likeButton(): Locator {
    return this.page.getByRole('button', {name: 'This answer was helpful'});
  }

  get dislikeButton(): Locator {
    return this.page.getByRole('button', {name: 'This answer was not helpful'});
  }

  get explainWhyButton(): Locator {
    return this.page.getByRole('button', {name: 'Explain why'});
  }

  get feedbackModalCancelButton(): Locator {
    return this.page.getByRole('button', {name: 'Cancel'});
  }

  get firstFeedbackOption(): Locator {
    return this.page.getByRole('radio', {name: 'feedback'}).first();
  }

  get feedbackSubmitButton(): Locator {
    return this.page.getByTestId('feedback-modal-footer__submit');
  }

  get feedbackCancelButton(): Locator {
    return this.page.getByTestId('feedback-modal-footer__cancel');
  }

  // ACTIONS
  async clickToggleButton(): Promise<void> {
    await this.smartSnippetToggleButton.click();
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

  async selectFirstFeedbackOption(): Promise<void> {
    await this.firstFeedbackOption.click();
  }

  async clickFeedbackSubmitButton(): Promise<void> {
    await this.feedbackSubmitButton.click();
  }

  async clickFeedbackCancelButton(): Promise<void> {
    await this.feedbackCancelButton.click();
  }

  // ANALYTICS
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

  async waitForFeedbackSubmitUaAnalytics(): Promise<Request> {
    return this.waitForSmartSnippetCustomUaAnalytics('sendSmartSnippetReason');
  }

  async waitForSmartSnippetClickUaAnalytics(
    actionCause: any
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaClickEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventValue: actionCause,
        };
        return Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );
      }
      return false;
    });
    return uaRequest;
  }

  async waitForSmartSnippetCustomUaAnalytics(
    eventValue: any
  ): Promise<Request> {
    const uaRequest = this.page.waitForRequest((request) => {
      if (isUaCustomEvent(request)) {
        const requestBody = request.postDataJSON?.();
        const expectedFields = {
          eventType: 'smartSnippet',
          eventValue: eventValue,
        };
        return Object.keys(expectedFields).every(
          (key) => requestBody?.[key] === expectedFields[key]
        );
      }
      return false;
    });
    return uaRequest;
  }
}
