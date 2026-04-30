import askFollowUp from '@salesforce/label/c.quantic_AskFollowUp';
import submitFollowUp from '@salesforce/label/c.quantic_SubmitFollowUp';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticAskFollowUpInput` component renders a simple text input for submitting follow-up questions.
 * @category Internal
 * @example
 * <c-quantic-ask-follow-up-input
 *   submit-button-disabled={isGenerating}
 *   onquantic__askfollowup={handleAskFollowUp}
 * ></c-quantic-ask-follow-up-input>
 */
export default class QuanticAskFollowUpInput extends LightningElement {
  /**
   * Whether the submit button should be disabled (e.g. while answer is generating).
   * @api
   * @type {boolean}
   * @default {false}
   */
  @api submitButtonDisabled = false;

  labels = {
    askFollowUp,
    submitFollowUp,
  };

  inputValue = '';
  /** @type {boolean} */
  isSubmitting = false;

  get isSubmitDisabled() {
    return this.submitButtonDisabled || this.isSubmitting;
  }

  handleInputChange(event) {
    this.inputValue = event.target.value;
  }

  handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }

  handleSubmit() {
    this.submit();
  }

  submit() {
    const trimmed = this.inputValue.trim();
    if (!trimmed || this.isSubmitDisabled) {
      return;
    }
    this.isSubmitting = true;
    this.dispatchEvent(
      new CustomEvent('quantic__askfollowup', {
        detail: {question: trimmed},
        bubbles: true,
      })
    );
    this.inputValue = '';
    this.isSubmitting = false;
  }
}
