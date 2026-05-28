import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import generatedAnswerCannotGenerateAnswer from '@salesforce/label/c.quantic_GeneratedAnswerCannotGenerateAnswer';
import generatedAnswerErrorGeneric from '@salesforce/label/c.quantic_GeneratedAnswerErrorGeneric';
import generatedAnswerErrorTurnLimitReached from '@salesforce/label/c.quantic_GeneratedAnswerErrorTurnLimitReached';
import thisAnswerWasHelpful from '@salesforce/label/c.quantic_ThisAnswerWasHelpful';
import thisAnswerWasNotHelpful from '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful';
import tryAgain from '@salesforce/label/c.quantic_TryAgain';
import {getAbsoluteHeight} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/** @typedef {import("@coveo/headless").GeneratedAnswerBase} GeneratedAnswerBase */
/** @typedef {import("@coveo/headless").GeneratedAnswerCitation} GeneratedAnswerCitation */
/**
 * @typedef {Partial<GeneratedAnswerBase> & {
 *   citations?: GeneratedAnswerCitation[];
 * }} QuanticGeneratedAnswerBodyState
 */

/**
 * The `QuanticGeneratedAnswerBody` component renders a single generated answer unit.
 * @category Internal
 * @fires CustomEvent#quantic__answercontentupdated
 * @fires CustomEvent#quantic__like
 * @fires CustomEvent#quantic__dislike
 * @fires CustomEvent#quantic__generatedanswercopy
 * @fires CustomEvent#quantic__citationhover
 * @fires CustomEvent#quantic__retry
 */
export default class QuanticGeneratedAnswerBody extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;
  /**
   * The generated answer state.
   * @api
    * @type {QuanticGeneratedAnswerBodyState}
   */
  @api generatedAnswer = {};
  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   */
  @api disableCitationAnchoring = false;
  /**
   * Whether the body should display the no-answer state.
   * @api
   * @type {boolean}
   */
  @api cannotAnswer = false;

  labels = {
    couldNotGenerateAnAnswer,
    generatedAnswerCannotGenerateAnswer,
    generatedAnswerErrorGeneric,
    generatedAnswerErrorTurnLimitReached,
    thisAnswerWasHelpful,
    thisAnswerWasNotHelpful,
    tryAgain,
  };

  get answerElementHeight() {
    return getAbsoluteHeight(
      // @ts-ignore
      this.answerContentElement?.firstElementChild || this.answerContentElement
    );
  }

  get answer() {
    return this.generatedAnswer?.answer;
  }

  get citations() {
    return this.generatedAnswer?.citations || [];
  }

  get answerId() {
    return this.generatedAnswer?.answerId;
  }

  get answerContentFormat() {
    return this.generatedAnswer?.answerContentFormat;
  }

  get isStreaming() {
    return !!this.generatedAnswer?.isStreaming;
  }

  get hasRetryableError() {
    return !!this.generatedAnswer?.error?.isRetryable;
  }

  get hasError() {
    return !!this.generatedAnswer?.error;
  }

  get shouldDisplayError() {
    return this.hasError && !this.hasRetryableError;
  }

  get shouldDisplayCannotAnswer() {
    return this.cannotAnswer || !!this.generatedAnswer?.cannotAnswer;
  }

  get errorMessage() {
    return this.generatedAnswer?.error?.isSseTurnLimitReachedError?.()
      ? this.labels.generatedAnswerErrorTurnLimitReached
      : this.labels.generatedAnswerErrorGeneric;
  }

  get computedFeedbackState() {
    if (this.generatedAnswer?.liked) {
      return 'liked';
    }

    if (this.generatedAnswer?.disliked) {
      return 'disliked';
    }

    return 'neutral';
  }

  get shouldShowCitations() {
    return this.citations.length > 0;
  }

  get shouldShowActions() {
    return Boolean(this.answer) && !this.isStreaming;
  }

  get shouldShowFeedback() {
    return !this.generatedAnswer?.feedbackSubmitted;
  }

  handleAnswerContentUpdated(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('quantic__answercontentupdated', {
        detail: {
          answerElementHeight: this.answerElementHeight,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  handleLike(event) {
    event.stopPropagation();
    this.dispatchAnswerInteractionEvent('quantic__like');
  }

  handleDislike(event) {
    event.stopPropagation();
    this.dispatchAnswerInteractionEvent('quantic__dislike');
  }

  handleCopy(event) {
    event.stopPropagation();
    this.dispatchAnswerInteractionEvent('quantic__generatedanswercopy');
  }

  handleRetry() {
    this.dispatchEvent(
      new CustomEvent('quantic__retry', {
        detail: {
          answerId: this.answerId,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  handleCitationHover = (citationId, citationHoverTimeMs) => {
    this.dispatchEvent(
      new CustomEvent('quantic__citationhover', {
        detail: {
          answerId: this.answerId,
          citationId,
          citationHoverTimeMs,
        },
        bubbles: true,
        composed: true,
      })
    );
  };

  dispatchAnswerInteractionEvent(eventName) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          answerId: this.answerId,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  get answerContentElement() {
    return this.template.querySelector('c-quantic-generated-answer-content');
  }

  get shouldDisplayAnswer() {
    return (
      !this.shouldDisplayError &&
      !this.hasRetryableError &&
      !this.shouldDisplayCannotAnswer
    );
  }
}
