import couldNotGenerateAnAnswer from '@salesforce/label/c.quantic_CouldNotGenerateAnAnswer';
import noGeneratedAnswer from '@salesforce/label/c.quantic_NoGeneratedAnswer';
import thisAnswerWasHelpful from '@salesforce/label/c.quantic_ThisAnswerWasHelpful';
import thisAnswerWasNotHelpful from '@salesforce/label/c.quantic_ThisAnswerWasNotHelpful';
import tryAgain from '@salesforce/label/c.quantic_TryAgain';
import {getAbsoluteHeight} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

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
   * The unique identifier of the answer represented by this body.
   * @api
   * @type {string}
   */
  @api answerId;
  /**
   * The answer content to display.
   * @api
   * @type {string}
   */
  @api answer = '';
  /**
   * The format of the answer content.
   * @api
   * @type {'text/plain' | 'text/markdown'}
   */
  @api answerContentFormat = 'text/plain';
  /**
   * The citations used to generate the answer.
   * @api
   * @type {import("coveo").GeneratedAnswerCitation[]}
   */
  @api citations = [];
  /**
   * Whether the answer is currently streaming.
   * @api
   * @type {boolean}
   */
  @api isStreaming = false;
  /**
   * The current feedback state for the answer.
   * @api
   * @type {'neutral' | 'liked' | 'disliked'}
   */
  @api feedbackState = 'neutral';
  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   */
  @api disableCitationAnchoring = false;
  /**
   * The classes to apply to the answer container.
   * @api
   * @type {string}
   */
  @api answerClass = 'generated-answer__answer';
  /**
   * The maximum collapsed height in pixels.
   * @api
   * @type {number}
   */
  @api maxCollapsedHeight = 250;
  /**
   * Whether to show the citations section.
   * @api
   * @type {boolean}
   */
  @api showCitations = false;
  /**
   * Whether to show the action controls.
   * @api
   * @type {boolean}
   */
  @api showActions = false;
  /**
   * Whether the body should display a retryable error prompt.
   * @api
   * @type {boolean}
   */
  @api hasRetryableError = false;
  /**
   * Whether the body should display the no-answer state.
   * @api
   * @type {boolean}
   */
  @api cannotAnswer = false;

  labels = {
    couldNotGenerateAnAnswer,
    noGeneratedAnswer,
    thisAnswerWasHelpful,
    thisAnswerWasNotHelpful,
    tryAgain,
  };

  get answerElementHeight() {
    return getAbsoluteHeight(
      // @ts-ignore
      this.answerElement?.firstElementChild || this.answerElement
    );
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

  get answerStyle() {
    return `--maxHeight: ${this.maxCollapsedHeight}px;`;
  }

  get answerElement() {
    return this.template.querySelector(
      '[data-testid="generated-answer-body__answer"]'
    );
  }

  get shouldDisplayAnswer() {
    return !this.hasRetryableError && !this.cannotAnswer;
  }
}
