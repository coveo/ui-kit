import submitFollowUp from '@salesforce/label/c.quantic_SubmitFollowUp';
import askFollowUp from '@salesforce/label/c.quantic_AskFollowUp';
import {keys} from 'c/quanticUtils';
import { LightningElement } from 'lwc';

export default class QuanticAskFollowUpInput extends LightningElement {
  labels = {
    submitFollowUp,
    askFollowUp
  }

  /** @type {string} */
  _inputValue = '';
  /** @type {boolean} */
  _focused = false;

  /**
   * @returns {HTMLInputElement|HTMLTextAreaElement}
   */
  get input() {
    return this.template.querySelector('input');
  }

  handleValueChange() {
    this.sendFollowUpInputValueChangeEvent(this.input.value);
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
    this.sendSubmitFollowUpEvent();
    this.input.blur();
  }

  handleFocus() {
    this._focused = true;
  }

  handleBlur() {
    this._focused = false;
  }

  /**
   * Sends the "quantic__followupinputvaluechange" event.
   * @param {string} value
   */
  sendFollowUpInputValueChangeEvent(value) {
    const inputValueChangeEvent = new CustomEvent('quantic__followupinputvaluechange', {
      detail: {
        value,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(inputValueChangeEvent);
  }

  /**
   * Sends the "quantic__submitFollowUp" event.
   */
  sendSubmitFollowUpEvent() {
    if (this._inputValue !== this.input.value) {
      this.sendFollowUpInputValueChangeEvent(this.input.value);
    }

    this.dispatchEvent(
      new CustomEvent('quantic__submitfollowup', {
        bubbles: true,
        composed: true,
      })
    );
  }

  get inputContainerClasses() {
    return `follow-up-input__input-container slds-box slds-grid slds-box_xx-small ${this._focused ? 'follow-up-input__input-container--focused' : ''}`;
  }
}