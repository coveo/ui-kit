import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import generatedAnswerErrorTurnLimitReached from '@salesforce/label/c.quantic_GeneratedAnswerErrorTurnLimitReached';
import genericErrorTitle from '@salesforce/label/c.quantic_GenericErrorTitle';
import thisAnswerWasHelpful from '@salesforce/label/c.quantic_ThisAnswerWasHelpful';
import thisAnswerWasNotHelpful from '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful';
import {LightningElement, api} from 'lwc';
// @ts-ignore
import answerTemplate from './templates/answer.html';
// @ts-ignore
import cannotAnswerTemplate from './templates/cannotAnswer.html';
// @ts-ignore
import errorTemplate from './templates/error.html';

/** @typedef {import("@coveo/headless").GeneratedAnswerBase} GeneratedAnswerBase */

const FEEDBACK_NEUTRAL_STATE = 'neutral';
const FEEDBACK_LIKED_STATE = 'liked';
const FEEDBACK_DISLIKED_STATE = 'disliked';

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
   * The generated answer object to render.
   * @api
   * @type {GeneratedAnswerBase}
   */
  @api generatedAnswer;
  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   */
  @api disableCitationAnchoring = false;

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
    return !!this.generatedAnswer?.error?.code;
  }

  get cannotAnswer() {
    return !!this.generatedAnswer?.cannotAnswer;
  }

  get errorMessage() {
    if (this.generatedAnswer?.error?.isSseTurnLimitReachedError?.()) {
      return this.labels.generatedAnswerErrorTurnLimitReached;
    }
    return this.labels.genericErrorTitle;
  }

  get computedFeedbackState() {
    if (this.generatedAnswer?.liked) return FEEDBACK_LIKED_STATE;
    if (this.generatedAnswer?.disliked) return FEEDBACK_DISLIKED_STATE;
    return FEEDBACK_NEUTRAL_STATE;
  }

  get shouldShowCitations() {
    return this.citations.length > 0;
  }

  get shouldShowActions() {
    return Boolean(this.answer) && !this.isStreaming;
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
    this.dispatchAnswerInteractionEvent('quantic__citationhover', {
      citationId,
      citationHoverTimeMs,
    });
  };

  dispatchAnswerInteractionEvent(eventName, payload = {}) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          answerId: this.answerId,
          ...payload,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (this.hasError) {
      return errorTemplate;
    }
    if (this.cannotAnswer) {
      return cannotAnswerTemplate;
    }
    return answerTemplate;
  }
}
