import submitFollowUp from '@salesforce/label/c.quantic_SubmitFollowUp';
import askFollowUp from '@salesforce/label/c.quantic_AskFollowUp';
import followUpInputTooLong from '@salesforce/label/c.quantic_FollowUpInputTooLong';
import {I18nUtils, keys} from 'c/quanticUtils';
import {api, LightningElement} from 'lwc';

/**
 * Maximum number of characters allowed in a follow-up question.
 */
const MAX_FOLLOW_UP_QUESTION_LENGTH = 300;

/**
 * The `QuanticGeneratedAnswerFollowUpInput` component allows users to submit follow-up questions related to a generated answer.
 * @fires CustomEvent#quantic__submitfollowup
 * @category Internal
 * @example
 * <c-quantic-generated-answer-follow-up-input></c-quantic-generated-answer-follow-up-input>
 */
export default class QuanticGeneratedAnswerFollowUpInput extends LightningElement {
  labels = {
    submitFollowUp,
    askFollowUp,
    followUpInputTooLong,
  };

  /**
   * Whether the submit button is disabled.
   * @type {boolean}
   * @defaultValue false
   */
  @api
  submitButtonDisabled = false;

  /** @type {boolean} */
  _focused = false;

  /** @type {number} */
  characterCount = 0;

  handleKeyDown(event) {
    // Let the browser commit IME text before handling shortcuts like Enter during composition.
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key === keys.ENTER && !event.shiftKey) {
      event.preventDefault();
      this.handleSubmitFollowUp();
    }

    if (event.key === keys.ESC) {
      event.stopPropagation();
      event.preventDefault();
      this.refs.askFollowUpInput.blur();
    }
  }

  handleSubmitFollowUp() {
    if (
      this.isSubmitPrevented ||
      this.refs.askFollowUpInput.value.trim() === ''
    ) {
      return;
    }
    this.sendSubmitFollowUpEvent();
    this.refs.askFollowUpInput.value = '';
    this.characterCount = 0;
    this.syncTextWithReplica();
    this.collapse();
  }

  handleFocus() {
    this._focused = true;
    this.syncTextWithReplica();
    this.expand();
  }

  handleBlur() {
    this._focused = false;
    this.collapse();
  }

  handleInput() {
    this.characterCount = this.refs.askFollowUpInput.value.trim().length;
    this.expand();
    this.syncTextWithReplica();
  }

  /**
   * Syncs the textarea value with the expander's replicated value for seamless CSS transitions.
   */
  syncTextWithReplica() {
    const expander = this.refs.expander;
    if (expander) {
      expander.dataset.replicatedValue = this.refs.askFollowUpInput.value;
    }
  }

  expand() {
    this.refs.expander?.classList.add('follow-up-input__expander--expanded');
  }

  collapse() {
    const expander = this.refs.expander;
    if (expander) {
      expander.classList.remove('follow-up-input__expander--expanded');
      delete expander.dataset.replicatedValue;
    }
  }

  /**
   * Sends the "quantic__submitfollowup" event.
   */
  sendSubmitFollowUpEvent() {
    this.dispatchEvent(
      new CustomEvent('quantic__submitfollowup', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.refs.askFollowUpInput.value.trim(),
        },
      })
    );
  }

  get inputContainerClasses() {
    return `follow-up-input__container slds-is-relative slds-grid slds-box slds-p-around_none ${this._focused ? 'follow-up-input__container--focused' : ''} ${this.isOverCharacterLimit ? 'follow-up-input__container--error' : ''}`;
  }

  get isOverCharacterLimit() {
    return this.characterCount > MAX_FOLLOW_UP_QUESTION_LENGTH;
  }

  get isSubmitPrevented() {
    return this.submitButtonDisabled || this.isOverCharacterLimit;
  }

  get textareaAriaInvalid() {
    return this.isOverCharacterLimit ? 'true' : 'false';
  }

  get textareaAriaDescribedBy() {
    return this.isOverCharacterLimit ? 'follow-up-validation-message' : null;
  }

  get characterCounterText() {
    return `${this.characterCount} / ${MAX_FOLLOW_UP_QUESTION_LENGTH}`;
  }

  get characterCounterClasses() {
    return `follow-up-input__counter slds-col_bump-left slds-text-body_small ${this.isOverCharacterLimit ? 'slds-text-color_error' : 'slds-text-color_weak'}`;
  }

  get validationMessage() {
    return I18nUtils.format(
      this.labels.followUpInputTooLong,
      MAX_FOLLOW_UP_QUESTION_LENGTH
    );
  }
}
