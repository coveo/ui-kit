import answerGenerated from '@salesforce/label/c.quantic_AnswerGenerated';
import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import feedback from '@salesforce/label/c.quantic_Feedback';
import generatedAnswerForYou from '@salesforce/label/c.quantic_GeneratedAnswerForYou';
import generatedAnswerIsHidden from '@salesforce/label/c.quantic_GeneratedAnswerIsHidden';
import generatingAnswer from '@salesforce/label/c.quantic_GeneratingAnswer';
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
import {AriaLiveRegion, I18nUtils} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import errorTemplate from './templates/errorTemplate.html';
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

const GENERATED_ANSWER_DATA_KEY = 'coveo-generated-answer-data';

/**
 * The `QuanticGeneratedAnswer` component automatically generates an answer using Coveo machine learning models to answer the query executed by the user.
 * @category Search
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
   * A list of fields to fetch with the citations used to generate the answer.
   * @api
   * @type {string}
   * @defaultValue `'sfid,sfkbid,sfkavid'`
   */
  @api fieldsToIncludeInCitations = 'sfid,sfkbid,sfkavid';
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
    generatingAnswer,
    generatedAnswerIsHidden,
    answerGenerated,
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
  /** @type {import('c/quanticUtils').AriaLiveUtils} */
  ariaLiveMessage;
  /** @type {boolean} */
  hasInitializationError = false;

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
    this.template.addEventListener(
      'quantic__generatedanswerrephrase',
      this.handleGeneratedAnswerRephrase
    );
    this.template.addEventListener(
      'quantic__generatedanswercopy',
      this.handleGeneratedAnswerCopyToClipboard
    );
    this.template.addEventListener(
      'quantic__generatedanswertoggle',
      this.handleGeneratedAnswerToggle
    );
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.ariaLiveMessage = AriaLiveRegion('GeneratedAnswer', this);
    this.headless = getHeadlessBundle(this.engineId);
    this.generatedAnswer = this.buildHeadlessGeneratedAnswerController(engine);
    this.searchStatus = this.headless.buildSearchStatus(engine);

    this.unsubscribeGeneratedAnswer = this.generatedAnswer.subscribe(() =>
      this.updateState()
    );
    this.unsubscribeSearchStatus = this.searchStatus.subscribe(() =>
      this.updateSearchStatusState()
    );
  };

  buildHeadlessGeneratedAnswerController(engine) {
    const storedGeneratedAnswerData = this.readStoredData();
    const storedGeneratedAnswerVisibility =
      storedGeneratedAnswerData?.isVisible;
    return this.headless.buildGeneratedAnswer(engine, {
      initialState: {
        isVisible: storedGeneratedAnswerVisibility === false ? false : true,
        responseFormat: {answerStyle: this.answerStyle},
      },
      fieldsToIncludeInCitations: this.citationFields,
    });
  }

  disconnectedCallback() {
    this.unsubscribeGeneratedAnswer?.();
    this.template.removeEventListener(
      'quantic__generatedanswerrephrase',
      this.handleGeneratedAnswerRephrase
    );
    this.template.removeEventListener(
      'quantic__generatedanswercopy',
      this.handleGeneratedAnswerCopyToClipboard
    );
    this.template.removeEventListener(
      'quantic__generatedanswertoggle',
      this.handleGeneratedAnswerToggle
    );
  }

  updateState() {
    this.state = this.generatedAnswer.state;
    this.updateFeedbackState();
    this.ariaLiveMessage.dispatchMessage(this.getGeneratedAnswerStatus());
  }

  getGeneratedAnswerStatus() {
    if (!this.state.isVisible) {
      return this.labels.generatedAnswerIsHidden;
    }

    if (this.hasRetryableError) {
      return this.labels.couldNotGenerateAnAnswer;
    }

    const isGenerating = this.state.isStreaming;
    if (isGenerating) {
      return this.labels.generatingAnswer;
    }

    const hasAnswer = !!this.state.answer;
    return hasAnswer
      ? I18nUtils.format(this.labels.answerGenerated, this.answer)
      : '';
  }

  updateSearchStatusState() {
    this.feedbackSubmitted = false;
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
   * handles hovering over a citation.
   * @param {string} id
   * @param {number} citationHoverTimeMs
   */
  handleCitationHover = (id, citationHoverTimeMs) => {
    this.generatedAnswer.logCitationHover(id, citationHoverTimeMs);
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

  handleGeneratedAnswerRephrase = (event) => {
    event.stopPropagation();
    this.generatedAnswer.rephrase({answerStyle: event?.detail});
  };

  handleGeneratedAnswerCopyToClipboard = (event) => {
    event.stopPropagation();
    this.generatedAnswer.logCopyToClipboard();
  };

  handleGeneratedAnswerToggle = (event) => {
    event.stopPropagation();
    if (this.isVisible) {
      this.generatedAnswer.hide();
      this.writeStoredDate({isVisible: false});
    } else {
      this.generatedAnswer.show();
      this.writeStoredDate({isVisible: true});
    }
  };

  readStoredData() {
    try {
      return JSON.parse(sessionStorage?.getItem(GENERATED_ANSWER_DATA_KEY));
    } catch {
      return {};
    }
  }

  writeStoredDate(data) {
    sessionStorage?.setItem(GENERATED_ANSWER_DATA_KEY, JSON.stringify(data));
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

  get shouldDisplayActions() {
    return this.isVisible && !this.isStreaming;
  }

  get isVisible() {
    return this.state.isVisible;
  }

  get shouldDisplayGeneratedAnswer() {
    return (
      !!this.answer ||
      this.isStreaming ||
      this.citations?.length > 0 ||
      this.hasRetryableError
    );
  }

  get generatedAnswerClass() {
    return `generated-answer__answer ${
      this.isStreaming ? 'generated-answer__answer--streaming' : ''
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

  get generatedAnswerFooterCssClass() {
    return `slds-grid slds-grid_align-spread generated-answer__footer--${
      this.multilineFooter ? 'multiline' : 'standard'
    }`;
  }

  get shouldHideRephraseLabels() {
    return this.multilineFooter ? false : true;
  }

  get citationFields() {
    return this.fieldsToIncludeInCitations
      ?.split(',')
      .map((field) => field.trim())
      .filter((field) => field.length > 0);
  }

  get rephraseButtonsCssClass() {
    return `slds-var-m-top_small slds-grid ${
      this.multilineFooter ? '' : 'slds-grid_align-end'
    }`;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  render() {
    if (this.hasInitializationError) {
      return errorTemplate;
    }
    if (this.isLoading) {
      return loadingTemplate;
    }
    if (this.hasRetryableError) {
      return retryPromptTemplate;
    }
    return generatedAnswerTemplate;
  }
}
