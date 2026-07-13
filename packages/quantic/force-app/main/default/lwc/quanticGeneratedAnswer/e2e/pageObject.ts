import type {Locator, Page, Request} from '@playwright/test';
import {
  AnalyticsMode,
  AnalyticsModeEnum,
} from '../../../../../../playwright/utils/analyticsMode';
import {AnalyticsObject} from '../../../../../../playwright/page-object/analytics';
import {isRgaEvaluationRequest} from '../../../../../../playwright/utils/requests';
import type {AgentMessage} from './agentData';

const minimumCitationTooltipDisplayDurationMs = 1500;
const removeUnknownFields = (object: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== 'unknown')
  );
};

const selectors = {
  addFacetsButton: 'c-action-add-facets button',
};

const facetElementsSelectors = {
  timeframeFacet: {
    component: 'c-quantic-timeframe-facet',
    facetValueComponent: 'c-quantic-facet-value',
  },
};

export interface GeneratedAnswerObjectConfig {
  answerApiEnabled?: boolean;
  headAnswerRequestRegex?: RegExp;
  agentFollowUpRequestRegex?: RegExp;
  isAgent?: boolean;
  withFacets?: boolean;
}

export class GeneratedAnswerObject {
  private analyticsMode: AnalyticsMode;
  private answerApiEnabled: boolean;
  private headAnswerRequestRegex?: RegExp;
  private agentFollowUpRequestRegex?: RegExp;
  private withFacets: boolean;
  private isAgent: boolean;

  constructor(
    private page: Page,
    private streamId: string,
    private analytics: AnalyticsObject,
    config: GeneratedAnswerObjectConfig = {}
  ) {
    this.page = page;
    this.streamId = streamId;
    this.analytics = analytics;
    this.analyticsMode = this.analytics.analyticsMode;
    this.answerApiEnabled = config.answerApiEnabled ?? false;
    this.headAnswerRequestRegex = config.headAnswerRequestRegex;
    this.agentFollowUpRequestRegex = config.agentFollowUpRequestRegex;
    this.withFacets = config.withFacets ?? false;
    this.isAgent = config.isAgent ?? false;
  }

  get likeButton(): Locator {
    return this.page.getByRole('button', {name: this.isAgent ? 'Like' : 'This answer was helpful', exact: true});
  }

  get dislikeButton(): Locator {
    return this.page.getByRole('button', {name: this.isAgent ? 'Dislike' : 'This answer was not helpful', exact: true});
  }

  get copyToClipboardButton(): Locator {
    return this.page.getByRole('button', {name: 'Copy'});
  }

  get toggleButton(): Locator {
    return this.page.getByTestId('generated-answer__toggle-button');
  }

  get firstTimeframeFacet(): Locator {
    return this.page
      .locator(facetElementsSelectors.timeframeFacet.component)
      .first();
  }

  get firstTimeframeFacetValue(): Promise<string | null> {
    return this.firstTimeframeFacet
      .locator(facetElementsSelectors.timeframeFacet.facetValueComponent)
      .first()
      .locator('.facet__value-text')
      .textContent();
  }

  get addFacetsButton(): Locator {
    return this.page.locator(selectors.addFacetsButton);
  }

  async clickAddFacetsButton(): Promise<void> {
    await this.addFacetsButton.click();
  }

  async clickFirstTimeframeFacetLink(): Promise<void> {
    await this.firstTimeframeFacet.click();
  }

  questionContainer(questionId: string): Locator {
    return this.page.getByTestId(questionId);
  }

  answerOption(questionId: string, answerValue: string): Locator {
    return this.questionContainer(questionId).locator('.slds-radio_button', {
      hasText: new RegExp(`^${answerValue}$`),
    });
  }

  get feedbackDocumentUrlInput(): Locator {
    return this.page.locator(
      '.feedback-modal-qna__body input[name="documentUrl"]'
    );
  }

  get feedbackDetailsInput(): Locator {
    return this.page
      .locator('.feedback-modal-qna__body [data-name="details"]')
      .getByRole('textbox');
  }

  get submitFeedbackButton(): Locator {
    return this.page.getByRole('button', {name: /Send feedback/i});
  }

  get completeFeedbackButton(): Locator {
    return this.page.getByRole('button', {name: /Done/i});
  }

  get citationLink(): Locator {
    return this.page
      .getByTestId(this.isAgent ? 'generated-answer-body__citations' : 'generated-answer__citations')
      .locator('.citation__link');
  }

  get showMoreButton(): Locator {
    return this.page.getByTestId('generated-answer__answer-toggle');
  }

  get showPreviousAnswersButton(): Locator {
    return this.page.getByTestId('show-previous-button');
  }

  get threadItems(): Locator {
    return this.page.locator('c-quantic-thread-item');
  }

  get threadItemTitleButton(): Locator {
    return this.threadItems.getByTestId('thread-item-title-button');
  }

  get generatedAnswerBody(): Locator {
    return this.page.locator('c-quantic-generated-answer-body');
  }

  async hoverOverCitation(index: number): Promise<void> {
    // waiting 1000ms to allow the component to render completely, cause any re-rendering abort the hover action.
    await this.page.waitForTimeout(1000);
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

  async clickCompleteFeedbackButton(): Promise<void> {
    await this.completeFeedbackButton.click();
  }

  async fillFeedbackForm(answers: Record<string, string>): Promise<void> {
    for (const [questionId, answerValue] of Object.entries(answers)) {
      const option = this.answerOption(questionId, answerValue);
      // eslint-disable-next-line no-await-in-loop
      await option.click();
    }
  }

  async clickLikeButton(): Promise<void> {
    await this.likeButton.click();
  }

  async clickNthLikeButton(answerIndex: number): Promise<void> {
    await this.likeButton.nth(answerIndex).click();
  }

  async clickDislikeButton(): Promise<void> {
    await this.dislikeButton.click();
  }

  async clickNthDislikeButton(answerIndex: number): Promise<void> {
    await this.dislikeButton.nth(answerIndex).click();
  }

  async clickCopyToClipboardButton(): Promise<void> {
    await this.copyToClipboardButton.click();
  }

  async clickToggleButton(): Promise<void> {
    await this.toggleButton.click();
  }

  async clickShowPreviousAnswersButton(): Promise<void> {
    await this.showPreviousAnswersButton.click();
  }

  async clickNthThreadItem(index: number): Promise<void> {
    await this.threadItemTitleButton.nth(index).click();
  }

  async waitForHeadAnswerRequest(): Promise<Request> {
    if (!this.headAnswerRequestRegex) {
      throw new Error('headAnswerRequestRegex is not configured');
    }
    return this.page.waitForRequest(this.headAnswerRequestRegex);
  }

  async waitForAgentFollowUpRequest(): Promise<Request> {
    if (!this.agentFollowUpRequestRegex) {
      throw new Error('agentFollowUpRequestRegex is not configured');
    }
    return this.page.waitForRequest(this.agentFollowUpRequestRegex);
  }

  async waitForStreamEndAnalytics(): Promise<Request | boolean> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'generatedAnswerStreamEnd',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === this.streamId
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.AnswerReceived',
      (event) => event.answerGenerated === true
    );
  }

  async waitForLikeGeneratedAnswerAnalytics(): Promise<Request> {
    return this.waitForLikeGeneratedAnswerAnalyticsForId(this.streamId);
  }

  async waitForLikeGeneratedAnswerAnalyticsForId(
    answerId: string
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'likeGeneratedAnswer',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === answerId
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.AnswerAction',
      (event) => event.action === 'like'
    );
  }

  async waitForDislikeGeneratedAnswerAnalytics(): Promise<Request> {
    return this.waitForDislikeGeneratedAnswerAnalyticsForId(this.streamId);
  }

  async waitForDislikeGeneratedAnswerAnalyticsForId(
    answerId: string
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'dislikeGeneratedAnswer',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === answerId
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.AnswerAction',
      (event) => event.action === 'dislike'
    );
  }

  async waitForCopyToClipboardAnalytics(): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'generatedAnswerCopyToClipboard',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === this.streamId
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.AnswerAction',
      (event) => event.action === 'copyToClipboard'
    );
  }

  async waitForShowAnswersAnalytics(): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'generatedAnswerShowAnswers',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === this.streamId
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.AnswerAction',
      (event) => event.action === 'show'
    );
  }

  async waitForHideAnswersAnalytics(): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'generatedAnswerHideAnswers',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === this.streamId
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.AnswerAction',
      (event) => event.action === 'hide'
    );
  }

  async waitForSourceHoverAnalytics(
    expectedPayload: Record<string, any>
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'generatedAnswerSourceHover',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === this.streamId &&
          Object.keys(expectedPayload).every(
            (key) => event?.customData?.[key] === expectedPayload[key]
          )
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.CitationHover',
      (event) =>
        event.citationId === expectedPayload.citationId &&
        event.itemMetadata?.uniqueFieldName === 'permanentid' &&
        event.itemMetadata?.uniqueFieldValue === expectedPayload.permanentId
    );
  }

  async waitForEvaluationsRequest(
    expectedPayload: Record<string, any>
  ): Promise<Request> {
    const payloadToMatch = removeUnknownFields(expectedPayload);

    const evaluationRequest = this.page.waitForRequest((request) => {
      const event = request.postDataJSON?.();
      if (isRgaEvaluationRequest(request)) {
        return AnalyticsObject.isMatchingPayload(
          {
            correctTopic: event.details?.correctTopic ? 'yes' : 'no',
            readable: event.details?.readable ? 'yes' : 'no',
            hallucinationFree: event.details?.hallucinationFree ? 'yes' : 'no',
            documented: event.details?.documented ? 'yes' : 'no',
            helpful: event.helpful,
            details: event.additionalNotes,
            documentUrl: event.correctAnswerUrl,
          },
          payloadToMatch
        );
      }
      return false;
    });
    return evaluationRequest;
  }

  async waitForFeedbackSubmitRequest(
    expectedPayload: Record<string, any>
  ): Promise<Request> {
    if (this.answerApiEnabled) {
      return this.waitForEvaluationsRequest(expectedPayload);
    }
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'generatedAnswerFeedbackSubmitV2',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === this.streamId &&
          Object.keys(expectedPayload).every(
            (key) => event?.customData?.[key] === expectedPayload[key]
          )
      );
    }

    const payloadToMatch = removeUnknownFields(expectedPayload);

    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.SubmitFeedback',
      (event) =>
        AnalyticsObject.isMatchingPayload(
          {
            correctTopic: event.details?.correctTopic ? 'yes' : 'no',
            readable: event.details?.readable ? 'yes' : 'no',
            hallucinationFree: event.details?.hallucinationFree ? 'yes' : 'no',
            documented: event.details?.documented ? 'yes' : 'no',
            helpful: event.helpful,
            details: event.additionalNotes,
            documentUrl: event.correctAnswerUrl,
          },
          payloadToMatch
        )
    );
  }

  async waitForCitationClickAnalytics(
    expectedPayload: Record<string, any>
  ): Promise<Request> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForClickUaAnalytics(
        'generatedAnswerCitationClick',
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === this.streamId &&
          AnalyticsObject.isMatchingPayload(
            {
              documentTitle: event.documentTitle,
              sourceName: event.sourceName,
              documentPosition: event.documentPosition,
              documentUri: event.documentUri,
              documentUrl: event.documentUrl,
              citationId: event.customData?.citationId,
              contentIDKey: event.customData?.documentId?.contentIdKey,
              contentIDValue: event.customData?.documentId?.contentIdValue,
            },
            expectedPayload
          )
      );
    }
    const payloadToMatch = {
      citationId: expectedPayload.citationId,
      uniqueFieldName: expectedPayload.contentIDKey,
      uniqueFieldValue: expectedPayload.contentIDValue,
      title: expectedPayload.documentTitle,
      url: expectedPayload.documentUrl,
    };
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.CitationClick',
      (event) =>
        AnalyticsObject.isMatchingPayload(
          {
            citationId: event.citationId,
            uniqueFieldName: event.itemMetadata?.uniqueFieldName,
            uniqueFieldValue: event.itemMetadata?.uniqueFieldValue,
            title: event.itemMetadata?.title,
            url: event.itemMetadata?.url,
          },
          payloadToMatch
        )
    );
  }

  async mockStreamResponse(
    url: string,
    body: Array<{payloadType: string; payload: string; finishReason?: string}>,
    answerId?: string
  ) {
    await this.page.route(url, (route) => {
      let bodyText = '';
      body.forEach((data) => {
        bodyText += `data: ${JSON.stringify(data)} \n\n`;
      });

      route.fulfill({
        status: 200,
        body: bodyText,
        headers: {
          'content-type': 'text/event-stream',
          ...(answerId && {
            'access-control-expose-headers': 'X-Answer-Id',
            'x-answer-id': answerId,
          }),
        },
      });
    });
  }

  async mockAgentAnswerResponse(
    body: Array<AgentMessage>
  ) {
    await this.page.route('**/agents/*/answer', (route) => {
      let bodyText = '';
      body.forEach((data) => {
        bodyText += `data:${JSON.stringify(data)} \n\n`;
      });
      route.fulfill({
        status: 200,
        body: bodyText,
        headers: {'content-type': 'text/event-stream'},
      });
    });
  }

  async mockAgentFollowUpResponse(
    bodies: Array<Array<AgentMessage>>
  ) {
    let callCount = 0;
    await this.page.route('**/agents/*/follow-up', (route) => {
      // After all provided response bodies are used, keep returning the last one
      // so any additional intercepted follow-up requests still receive a mocked stream.
      const streams = bodies[Math.min(callCount, bodies.length - 1)];
      callCount++;

      let bodyText = '';
      streams.forEach((data) => {
        bodyText += `data:${JSON.stringify(data)} \n\n`;
      });
      route.fulfill({
        status: 200,
        body: bodyText,
        headers: {'content-type': 'text/event-stream'},
      });
    });
  }

  get followUpInput(): Locator {
    return this.page.locator(
      'c-quantic-generated-answer-follow-up-input textarea'
    );
  }

  get followUpSubmitButton(): Locator {
    return this.page
      .locator('c-quantic-generated-answer-follow-up-input')
      .getByRole('button', {name: 'Submit follow-up'});
  }

  async typeFollowUpQuestion(question: string): Promise<void> {
    await this.followUpInput.fill(question);
  }

  async submitFollowUp(): Promise<void> {
    await this.followUpSubmitButton.click();
  }

  async waitForFollowUpStreamEndAnalytics(
    followUpAnswerId: string
  ): Promise<Request | boolean> {
    if (this.analyticsMode === AnalyticsModeEnum.legacy) {
      return this.analytics.waitForCustomUaAnalytics(
        {
          eventType: 'generatedAnswer',
          eventValue: 'generatedAnswerStreamEnd',
        },
        (event) =>
          event?.customData?.generativeQuestionAnsweringId === followUpAnswerId
      );
    }
    return this.analytics.waitForEventProtocolAnalytics(
      'Rga.AnswerReceived',
      (event) => event.answerGenerated === true
    );
  }

  streamEndAnalyticRequestPromise!: Promise<boolean | Request>;
  generateRequestPromise!: Promise<Request>;
}
