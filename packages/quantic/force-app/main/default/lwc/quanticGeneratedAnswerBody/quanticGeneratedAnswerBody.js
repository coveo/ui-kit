import {LightningElement, api} from 'lwc';
import thisAnswerWasHelpful from '@salesforce/label/c.quantic_ThisAnswerWasHelpful';
import thisAnswerWasNotHelpful from '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful';

/** @typedef {import("coveo").GeneratedAnswerBase} GeneratedAnswer */

const FEEDBACK_LIKED_STATE = 'liked';
const FEEDBACK_DISLIKED_STATE = 'disliked';
const FEEDBACK_NEUTRAL_STATE = 'neutral';

/**
 * The `QuanticGeneratedAnswerBody` component renders a single generated answer.
 * It also re-dispatches answer interaction events so parent components can
 * handle them with the corresponding generated answer identifier.
 * @fires CustomEvent#quantic__like
 *   Dispatched when the user likes the answer.
 *   `event.detail.answerId` contains the generated answer identifier.
 * @fires CustomEvent#quantic__dislike
 *   Dispatched when the user dislikes the answer.
 *   `event.detail.answerId` contains the generated answer identifier.
 * @fires CustomEvent#quantic__generatedanswercopy
 *   Dispatched when the user copies the answer to the clipboard.
 *   `event.detail.answerId` contains the generated answer identifier.
 * @fires CustomEvent#quantic__citationhover
 *   Dispatched when the user hovers a citation long enough to trigger analytics.
 *   `event.detail` contains the `citationId` and `citationHoverTimeMs`.
 * @category Internal
 */
export default class QuanticGeneratedAnswerBody extends LightningElement {
  /**
   * The generated answer object to render.
   * @api
   * @type {GeneratedAnswer}
   */
  @api generatedAnswer;

  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   * @default false
   */
  @api disableCitationAnchoring = false;

  labels = {
    thisAnswerWasHelpful,
    thisAnswerWasNotHelpful,
  };

  get shouldDisplayCitations() {
    return !!this.generatedAnswer?.citations?.length;
  }

  get shouldDisplayActions() {
    return (
      Boolean(this.generatedAnswer?.answer) &&
      !this.generatedAnswer?.isStreaming
    );
  }

  get feedbackState() {
    if (this.generatedAnswer?.liked) return FEEDBACK_LIKED_STATE;
    if (this.generatedAnswer?.disliked) return FEEDBACK_DISLIKED_STATE;
    return FEEDBACK_NEUTRAL_STATE;
  }

  get answerId() {
    return this.generatedAnswer?.answerId;
  }

  /**
   * Re-dispatches the like interaction with the current answer identifier.
   * @param {Event} event
   */
  handleLike(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('quantic__like', {
        detail: {answerId: this.answerId},
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Re-dispatches the dislike interaction with the current answer identifier.
   * @param {Event} event
   */
  handleDislike(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('quantic__dislike', {
        detail: {answerId: this.answerId},
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Re-dispatches the copy interaction with the current answer identifier.
   * @param {Event} event
   */
  handleGeneratedAnswerCopy(event) {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('quantic__generatedanswercopy', {
        detail: {answerId: this.answerId},
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Re-dispatches citation hover analytics data from the citations component.
   * @param {string} citationId
   * @param {number} citationHoverTimeMs
   */
  handleCitationHover = (citationId, citationHoverTimeMs) => {
    this.dispatchEvent(
      new CustomEvent('quantic__citationhover', {
        detail: {citationId, citationHoverTimeMs},
        bubbles: true,
        composed: true,
      })
    );
  };
}
