import showPreviousQuestions from '@salesforce/label/c.quantic_ShowPreviousQuestions';
import {LightningElement, api} from 'lwc';

const MIN_ANSWERS_TO_COLLAPSE = 2;

/**
 * The `QuanticGeneratedAnswerThread` component renders a thread of generated answers.
 * It lets answer interaction events from `QuanticGeneratedAnswerBody` bubble up
 * so parent components can handle them at the thread level.
 * @fires CustomEvent#quantic__like
 *   Dispatched when the user likes an answer.
 *   `event.detail.answerId` contains the generated answer identifier.
 * @fires CustomEvent#quantic__dislike
 *   Dispatched when the user dislikes an answer.
 *   `event.detail.answerId` contains the generated answer identifier.
 * @fires CustomEvent#quantic__generatedanswercopy
 *   Dispatched when the user copies an answer to the clipboard.
 *   `event.detail.answerId` contains the generated answer identifier.
 * @fires CustomEvent#quantic__citationhover
 *   Dispatched when the user hovers a citation long enough to trigger analytics.
 *   `event.detail` contains the `citationId` and `citationHoverTimeMs`.
 * @category Internal
 */
export default class QuanticGeneratedAnswerThread extends LightningElement {
  /**
   * The list of generated answers to render.
   * @api
   * @type {Array<object>}
   */
  @api
  get generatedAnswers() {
    return this._generatedAnswers;
  }
  set generatedAnswers(value) {
    const nextAnswers = value ?? [];
    if (this._generatedAnswers.length !== nextAnswers.length) {
      this.allGeneratedAnswersDisplayed = false;
    }
    this._generatedAnswers = nextAnswers;
  }

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
    showPreviousQuestions,
  };

  /** @type {Array<object>} */
  _generatedAnswers = [];
  /** @type {boolean} */
  allGeneratedAnswersDisplayed = false;

  handleShowAllClick() {
    this.allGeneratedAnswersDisplayed = true;
  }

  get shouldShowPreviousAnswersButton() {
    return (
      this.generatedAnswers.length > MIN_ANSWERS_TO_COLLAPSE &&
      !this.allGeneratedAnswersDisplayed
    );
  }

  get previousQuestionsCount() {
    return Math.max(this.generatedAnswers.length - 1, 0);
  }

  get showPreviousQuestionsLabel() {
    if (!this.previousQuestionsCount) {
      return this.labels.showPreviousQuestions;
    }

    return `${this.labels.showPreviousQuestions} (${this.previousQuestionsCount})`;
  }

  get visibleAnswers() {
    const answers = this.shouldShowPreviousAnswersButton
      ? this.generatedAnswers.slice(-1)
      : this.generatedAnswers;
    const showTimelineDot = this.generatedAnswers.length > 1;

    return answers.map((answer, index) => {
      const isLastAnswer = index === answers.length - 1;

      return {
        ...answer,
        key: answer.answerId || `${answer.question || 'generated-answer'}-${index}`,
        hideLine: isLastAnswer,
        disableCollapse: isLastAnswer,
        isExpanded: isLastAnswer,
        showTimelineDot,
      };
    });
  }
}
