import {LightningElement, api} from 'lwc';
import showPreviousQuestions_plural from '@salesforce/label/c.quantic_ShowPreviousQuestions_plural';
import {I18nUtils} from 'c/quanticUtils';

/** @typedef {import("coveo").GeneratedAnswerBase} GeneratedAnswer */

const MIN_ANSWERS_TO_COLLAPSE = 2;

/**
 * The `QuanticGeneratedAnswerThread` component renders a thread of generated answers, including the initial answer and follow-up answers.
 * @category Internal
 * @example
 * <c-quantic-generated-answer-thread engine-id={engineId} generated-answers={generatedAnswers}></c-quantic-generated-answer-thread>
 */
export default class QuanticGeneratedAnswerThread extends LightningElement {
  /**
   * The ID of the engine instance the component registers to.
   * @api
   * @type {string}
   */
  @api engineId;

  /**
   * The list of generated answers to render in the thread.
   * @api
   * @type {GeneratedAnswer[]}
   */
  @api
  get generatedAnswers() {
    return this._generatedAnswers;
  }
  set generatedAnswers(value) {
    const previous = this._generatedAnswers;
    this._generatedAnswers = value ?? [];
    if (previous?.length !== this._generatedAnswers.length) {
      this._allAnswersDisplayed = false;
    }
  }

  /**
   * Whether to disable citation anchoring.
   * @api
   * @type {boolean}
   * @defaultValue `false`
   */
  @api disableCitationAnchoring = false;

  /** @type {boolean} */
  _allAnswersDisplayed = false;
  /** @type {GeneratedAnswer[]} */
  _generatedAnswers = [];

  labels = {
    showPreviousQuestions_plural,
  };

  get isSingleAnswer() {
    return this.generatedAnswers.length === 1;
  }

  get shouldCollapseOlderAnswers() {
    return (
      this.generatedAnswers.length > MIN_ANSWERS_TO_COLLAPSE &&
      !this._allAnswersDisplayed
    );
  }

  get hiddenAnswerCount() {
    return this.generatedAnswers.length - 1;
  }

  get showPreviousLabel() {
    return I18nUtils.format(this.labels.showPreviousQuestions_plural, this.hiddenAnswerCount);
  }

  get previousAnswers() {
    if (this.shouldCollapseOlderAnswers) {
      return [];
    }
    return this.generatedAnswers.slice(0, -1);
  }

  get hasPreviousAnswers() {
    return this.previousAnswers.length > 0;
  }

  get headAnswer() {
    return this.generatedAnswers[0];
  }

  get lastAnswer() {
    return this.generatedAnswers[this.generatedAnswers.length - 1];
  }

  handleShowAllClick() {
    this._allAnswersDisplayed = true;
  }
}
