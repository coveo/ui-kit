import submitFollowUp from '@salesforce/label/c.quantic_SubmitFollowUp';
import askFollowUp from '@salesforce/label/c.quantic_AskFollowUp';
import {keys} from 'c/quanticUtils';
import {api, LightningElement} from 'lwc';

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

  handleKeyDown(event) {
    // Let the browser commit IME text before handling shortcuts like Enter during composition.
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key === keys.ENTER) {
      event.preventDefault();
      this.handleSubmitFollowUp();
    }
  }

  handleSubmitFollowUp() {
    if (
      this.submitButtonDisabled ||
      this.refs.askFollowUpInput.value.trim() === ''
    ) {
      return;
    }
    this.sendSubmitFollowUpEvent();
    this.refs.askFollowUpInput.value = '';
  }

  handleFocus() {
    this._focused = true;
  }

  handleBlur() {
    this._focused = false;
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
          value: this.refs.askFollowUpInput.value,
        },
      })
    );
  }

  get inputContainerClasses() {
    return `follow-up-input__input-container slds-box slds-grid slds-box_xx-small ${this._focused ? 'follow-up-input__input-container--focused' : ''}`;
  }
}
