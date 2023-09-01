import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import generatedAnswerForYou from '@salesforce/label/c.quantic_GeneratedAnswerForYou';
import loading from '@salesforce/label/c.quantic_Loading';
import thisAnswerWasHelpful from '@salesforce/label/c.quantic_ThisAnswerWasHelpful';
import thisAnswerWasNotHelpful from '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful';
import tryAgain from '@salesforce/label/c.quantic_TryAgain';
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
 * <c-quantic-generated-answer engine-id={engineId}></c-quantic-generated-answer>
 */
export default class QuanticGeneratedAnswer extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  labels = {
    generatedAnswerForYou,
    loading,
    thisAnswerWasNotHelpful,
    thisAnswerWasHelpful,
    tryAgain,
    couldNotGenerateAnAnswer,
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

  connectedCallback() {
    registerComponentForInit(this, this.engineId);
  }

  renderedCallback() {
    initializeWithHeadless(this, this.engineId, this.initialize);
  }

  /**
   * @param {SearchEngine} engine
   */
  initialize = (engine) => {
    this.headless = getHeadlessBundle(this.engineId);
    this.generatedAnswer = this.headless.buildGeneratedAnswer(engine);
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
  handleDislike(event) {
    event.stopPropagation();
    this.generatedAnswer.dislike?.();
  }

  handleRetry() {
    this.generatedAnswer.retry();
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
