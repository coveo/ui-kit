import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import feedback from '@salesforce/label/c.quantic_Feedback';
import generatedAnswerForYou from '@salesforce/label/c.quantic_GeneratedAnswerForYou';
import harmful from '@salesforce/label/c.quantic_Harmful';
import inaccurate from '@salesforce/label/c.quantic_Inaccurate';
import irrelevant from '@salesforce/label/c.quantic_Irrelevant';
import loading from '@salesforce/label/c.quantic_Loading';
import other from '@salesforce/label/c.quantic_Other';
import outOfDate from '@salesforce/label/c.quantic_OutOfDate';
import thisAnswerWasHelpful from '@salesforce/label/c.quantic_ThisAnswerWasHelpful';
import thisAnswerWasNotHelpful from '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful';
import tryAgain from '@salesforce/label/c.quantic_TryAgain';
import whyGeneratedAnswerWasNotHelpful from '@salesforce/label/c.quantic_WhyGeneratedAnswerWasNotHelpful';
import FeedbackModal from 'c/quanticFeedbackModal';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import generatedAnswerTemplate from './templates/generatedAnswer.html';
// @ts-ignore
import loadingTemplate from './templates/loading.html';
// @ts-ignore
import retryPromptTemplate from './templates/retryPrompt.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").GeneratedAnswer} GeneratedAnswer */
/** @typedef {import("coveo").GeneratedAnswerState} GeneratedAnswerState */
/** @typedef {import("coveo").GeneratedAnswerCitation} GeneratedAnswerCitation */
/** @typedef { 'neutral' | 'liked' | 'disliked'} FeedbackState */
/** @typedef {import("coveo").SearchStatus} SearchStatus */
/** @typedef {import("coveo").SearchStatusState} SearchStatusState */

const FEEDBACK_LIKED_STATE = 'liked';
const FEEDBACK_DISLIKED_STATE = 'disliked';
const FEEDBACK_NEUTRAL_STATE = 'neutral';

/**
 * The `QuanticGeneratedAnswer` component automatically generates an answer using Coveo machine learning models to answer the query executed by the user.
 * @category Internal
 * @example
 * <c-quantic-generated-answer engine-id={engineId} answer-style="step"></c-quantic-generated-answer>
 */
export default class QuanticGeneratedAnswer extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The answer style to apply when the component first loads.
   * Options:
   *   - `default`: Generates the answer without additional formatting instructions.
   *   - `bullet`: Requests the answer to be generated in bullet-points.
   *   - `step`: Requests the answer to be generated in step-by-step instructions.
   *   - `concise`: Requests the answer to be generated as concisely as possible.
   * @api
   * @type {'default' | 'step' | 'bullet' | 'concise'}
   * @default {'default'}
   */
  @api answerStyle = 'default';
  /**
   * Indicates whether footer sections should be displayed on multiple lines.
   * @api
   * @type {boolean}
   * @default {false}
   */
  @api multilineFooter;

  labels = {
    generatedAnswerForYou,
    loading,
    thisAnswerWasNotHelpful,
    thisAnswerWasHelpful,
    tryAgain,
    couldNotGenerateAnAnswer,
    other,
    harmful,
    irrelevant,
    inaccurate,
    outOfDate,
    feedback,
    whyGeneratedAnswerWasNotHelpful,
  };

  /** @type {GeneratedAnswer} */
  generatedAnswer;
  /** @type {GeneratedAnswerState} */
  state;
  /** @type {FeedbackState} */
  feedbackState = 'neutral';
  /** @type {SearchStatus} */
  searchStatus;
  /** @type {SearchStatusState} */
  searchStatusState;
  /** @type {boolean} */
  feedbackSubmitted = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.template.addEventListener(
      'quantic__generatedanswerrephrase',
      this.handleGeneratedAnswerRephrase.bind(this)
    );
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.generatedAnswer = this.headless.buildGeneratedAnswer(engine, {
      initialState: {
        responseFormat: {answerStyle: this.answerStyle},
      },
    });
    this.searchStatus = this.headless.buildSearchStatus(engine);

    this.unsubscribeGeneratedAnswer = this.generatedAnswer.subscribe(() =>
      this.updateState()
    );
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  };

  disconnectedCallback() {
    this.unsubscribeGeneratedAnswer?.();
    this.template.removeEventListener(
      'quantic__generatedanswerrephrase',
      this.handleGeneratedAnswerRephrase.bind(this)
    );
  }

  updateState() {
    this.state = this.generatedAnswer.state;
    this.updateFeedbackState();
  }

  updateSearchStatusState() {
    this.searchStatusState = this.searchStatus.state;
  }

  updateFeedbackState() {
    if (this.state?.liked) {
      this.feedbackState = FEEDBACK_LIKED_STATE;
    } else if (this.state?.disliked) {
      this.feedbackState = FEEDBACK_DISLIKED_STATE;
    } else {
      this.feedbackState = FEEDBACK_NEUTRAL_STATE;
    }
  }

  /**
   * handles clicking on a citation.
   * @param {string} id
   */
  handleCitationClick = (id) => {
    this.generatedAnswer.logCitationClick(id);
  };

  /**
   * handles liking the generated answer.
   * @param {CustomEvent} event
   */
  handleLike(event) {
    event.stopPropagation();
    this.generatedAnswer.like?.();
  }

  /**
   * handles disliking the generated answer.
   * @param {CustomEvent} event
   */
  async handleDislike(event) {
    event.stopPropagation();
    this.generatedAnswer.dislike?.();
    if (!this.feedbackSubmitted) {
      // @ts-ignore
      await FeedbackModal.open({
        label: this.labels.feedback,
        size: 'small',
        description: this.labels.feedback,
        options: this.options,
        handleSubmit: this.submitFeedback.bind(this),
        optionsLabel: this.labels.whyGeneratedAnswerWasNotHelpful,
      });
      this.generatedAnswer.closeFeedbackModal();
    }
  }

  /**
   * Submits the feedback
   * @returns {void}
   */
  submitFeedback(feedbackPayload) {
    if (feedbackPayload?.details) {
      this.generatedAnswer.sendDetailedFeedback(feedbackPayload.details);
    } else if (feedbackPayload?.value) {
      this.generatedAnswer.sendFeedback(feedbackPayload.value);
    }
    this.feedbackSubmitted = true;
  }

  handleRetry() {
    this.generatedAnswer.retry();
  }

  handleGeneratedAnswerRephrase(event) {
    event.stopPropagation();
    this.generatedAnswer.rephrase({answerStyle: event?.detail});
  }

  get answer() {
    return this?.state?.answer;
  }

  get citations() {
    return this?.state?.citations;
  }

  get hasCitations() {
    return !!this.citations.length;
  }

  get isLoading() {
    return this?.state?.isLoading;
  }

  get isStreaming() {
    return this?.state?.isStreaming;
  }

  get shouldDisplayGeneratedAnswer() {
    return (
      !!this.answer ||
      this.isStreaming ||
      this.citations?.length > 0 ||
      this.hasRetryableError
    );
  }

  get generatedContentClass() {
    return `generated-answer__content ${
      this.isStreaming ? 'generated-answer__content--streaming' : ''
    }`;
  }

  get hasRetryableError() {
    return !this?.searchStatusState?.hasError && this.state?.error?.isRetryable;
  }

  /**
   * Returns the options displayed in the Quantic Feedback Modal.
   */
  get options() {
    return [
      {
        label: this.labels.irrelevant,
        value: 'irrelevant',
      },
      {
        label: this.labels.inaccurate,
        value: 'notAccurate',
      },
      {
        label: this.labels.outOfDate,
        value: 'outOfDate',
      },
      {
        label: this.labels.harmful,
        value: 'harmful',
      },
      {
        label: this.labels.other,
        value: 'other',
        withDetails: true,
        detailsRequired: true,
      },
    ];
  }

  get responseFormat() {
    return this.state?.responseFormat.answerStyle;
  }

  get shouldDisplayActions() {
    return !this.isStreaming;
  }

  get generatedAnswerFooterCssClass() {
    return `slds-grid ${
      this.multilineFooter
        ? 'generated-answer__footer--multiline'
        : 'generated-answer__footer--standard'
    }`;
  }

  get rephraseLabelsShouldBeHidden() {
    return this.multilineFooter ? false : true;
  }

  render() {
    if (this.isLoading) {
      return loadingTemplate;
    }
    if (this.hasRetryableError) {
      return retryPromptTemplate;
    }
    return generatedAnswerTemplate;
  }
}
