import generatedAnswerForYou from '@salesforce/label/c.quantic_GeneratedAnswerForYou';
import loading from '@salesforce/label/c.quantic_Loading';
import {
  registerComponentForInit,
  initializeWithHeadless,
  getHeadlessBundle,
} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import generatedAnswerTemplate from './generatedAnswer.html';
// @ts-ignore
import loadingTemplate from './loading.html';

/** @typedef {import("coveo").SearchEngine} SearchEngine */
/** @typedef {import("coveo").GeneratedAnswer} GeneratedAnswer */
/** @typedef {import("coveo").GeneratedAnswerState} GeneratedAnswerState */
/** @typedef {import("coveo").GeneratedAnswerCitation} GeneratedAnswerCitation */

/**
 * The `QuanticGeneratedAnswer` component automatically generates an answer using Coveo machine learning models to answer the query executed by the user.
 * @category Search
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
  };

  /** @type {GeneratedAnswer} */
  generatedAnswer;
  /** @type {GeneratedAnswerState} */
  state;
  /** @type {'neutral' | 'liked' | 'disliked'} */
  feedbackState = 'neutral';

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
    this.unsubscribeGeneratedAnswer = this.generatedAnswer.subscribe(() =>
      this.updateState()
    );
  };

  disconnectedCallback() {
    this.unsubscribeGeneratedAnswer?.();
  }

  updateState() {
    this.state = this.generatedAnswer.state;
    this.updateFeedbackState();
  }

  updateFeedbackState() {
    if (this.state?.liked) {
      this.feedbackState = 'liked';
    } else if (this.state?.disliked) {
      this.feedbackState = 'disliked';
    } else {
      this.feedbackState = 'neutral';
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

  get answer() {
    return this?.state?.answer;
  }

  get citations() {
    return this?.state?.citations;
  }

  get isLoading() {
    return this?.state?.isLoading;
  }

  get isStreaming() {
    return this?.state?.isStreaming;
  }

  get shouldDisplayGeneratedAnswer() {
    return !!this.answer || this.isStreaming || !!this.citations?.length;
  }

  get generatedContentClass() {
    return `${this.isStreaming ? 'generated-answer__content--streaming' : ''}`;
  }

  render() {
    if (this.isLoading) {
      return loadingTemplate;
    }
    return generatedAnswerTemplate;
  }
}
