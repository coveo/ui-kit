import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import generatedAnswerErrorTurnLimitReached from '@salesforce/label/c.quantic_GeneratedAnswerErrorTurnLimitReached';
import genericErrorTitle from '@salesforce/label/c.quantic_GenericErrorTitle';
import thisAnswerWasHelpful from '@salesforce/label/c.quantic_ThisAnswerWasHelpful';
import thisAnswerWasNotHelpful from '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful';
import {LightningElement, api} from 'lwc';

/** @typedef {import("@coveo/headless").GeneratedAnswerState} GeneratedAnswerState */

/**
 * The `QuanticGeneratedAnswerBody` component renders a single generated answer unit.
 * @category Internal
 * @fires CustomEvent#quantic__like
 * @fires CustomEvent#quantic__dislike
 * @fires CustomEvent#quantic__generatedanswercopy
 * @fires CustomEvent#quantic__citationhover
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
   * @type {GeneratedAnswerState}
   */
  @api generatedAnswer;
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
    generatedAnswerErrorTurnLimitReached,
    genericErrorTitle,
    thisAnswerWasHelpful,
    thisAnswerWasNotHelpful,
  };

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

  get hasError() {
    return !!this.generatedAnswer?.error && !this.answer;
  }

  get shouldDisplayCannotAnswer() {
    return this.cannotAnswer || !!this.generatedAnswer?.cannotAnswer;
  }

  get errorMessage() {
    if (this.generatedAnswer?.error?.isSseTurnLimitReachedError?.()) {
      return this.labels.generatedAnswerErrorTurnLimitReached;
    }
    return this.labels.genericErrorTitle;
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

  get shouldDisplayAnswer() {
    return !this.hasError && !this.shouldDisplayCannotAnswer;
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
}
