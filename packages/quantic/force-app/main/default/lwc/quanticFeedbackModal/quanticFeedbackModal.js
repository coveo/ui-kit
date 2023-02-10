// @ts-nocheck
import LightningModal from 'lightning/modal';
import {api} from 'lwc';
// @ts-ignore
import feedbackFormTemplate from './feedbackForm.html';
// @ts-ignore
import feedbackSuccessTemplate from './feedbackSuccess.html';


export default class QuanticFeedbackModal extends LightningModal {
  /**
   * The list of options to be displayed in the modal.
   */
  @api content;

  /** @type {string} */
  optionsValue;
  /** @type {string} */
  reasonValue;
  /** @type {string} */
  feedbackSubmitted = false;
  /** @type {string} */
  reasonInputError = false;

  connectedCallback(){
    console.log()
  }

  /**
   * 
   */
  get options() {
    return this?.content?.options;
  }

  closeModal() {
    this.close();
  }

  get optionsInput() {
    return this.template.querySelector('lightning-radio-group');
  }

  get reasonInput() {
    return this.template.querySelector('textarea');
  }

  get reasonFormClass() {
    return `slds-form-element ${this.reasonInputError ? 'slds-has-error' : ''}`;
  }

  handleOptionChange(event) {
    this.reasonInputError = false;
    this.optionsInput.setCustomValidity();
    this.optionsInput.reportValidity();
    this.optionsValue = event.detail.value;
  }

  handleReasonChange(event) {
    this.reasonInputError = false;
    this.reasonValue = event.target.value;
  }

  get displayReasonInput() {
    return this.optionsValue === 'other';
  }

  submitFeedback() {
    if (
      (this.optionsValue === 'other' && !!this.reasonValue) ||
      (!!this.optionsValue && this.optionsValue !== 'other')
    ) {
      this.sendFeedbackSuccessEvent();
      this.feedbackSubmitted = true;
    } else {
      if (this.optionsValue === 'other') {
        this.reasonInputError = true;
      } else {
        this.optionsInput.setCustomValidity('Value is required');
        this.optionsInput.reportValidity();
      }
    }
  }

  sendFeedbackSuccessEvent() {
    this.dispatchEvent(
      new CustomEvent('quantic__feedbacksuccess', {
        detail: {
          value: this.optionsValue,
          reason: this.reasonValue,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (this.feedbackSubmitted) {
      return feedbackSuccessTemplate;
    }
    return feedbackFormTemplate;
  }
}
