import submitFollowUp from '@salesforce/label/c.quantic_SubmitFollowUp';
import askFollowUp from '@salesforce/label/c.quantic_AskFollowUp';
import {keys} from 'c/quanticUtils';
import {api, LightningElement} from 'lwc';

export default class QuanticGeneratedAnswerFollowUpInput extends LightningElement {
  labels = {
    submitFollowUp,
    askFollowUp,
  };

  @api
  submitButtonDisabled = false;

  /** @type {string} */
  _inputValue = '';
  /** @type {boolean} */
  _focused = false;

  /**
   * @returns {HTMLInputElement}
   */
  get input() {
    return this.template.querySelector('input');
  }

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
    if(this.input.value.trim() === '') {
      return;
    }
    this.sendSubmitFollowUpEvent();
    this.input.value = '';
    this.input.blur();
  }

  handleFocus() {
    this._focused = true;
  }

  handleBlur() {
    this._focused = false;
  }

  /**
   * Sends the "quantic__submitFollowUp" event.
   */
  sendSubmitFollowUpEvent() {
    this.dispatchEvent(
      new CustomEvent('quantic__submitfollowup', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.input.value,
        },
      })
    );
  }

  get inputContainerClasses() {
    return `follow-up-input__input-container slds-box slds-grid slds-box_xx-small ${this._focused ? 'follow-up-input__input-container--focused' : ''}`;
  }
}
