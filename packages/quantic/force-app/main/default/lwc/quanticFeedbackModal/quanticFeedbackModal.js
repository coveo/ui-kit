// @ts-nocheck
import cancel from '@salesforce/label/c.quantic_Cancel';
import done from '@salesforce/label/c.quantic_Done';
import explainWhy from '@salesforce/label/c.quantic_ExplainWhy';
import fillOutField from '@salesforce/label/c.quantic_FillOutField';
import selectOneOfOptions from '@salesforce/label/c.quantic_SelectOneOfOptions';
import selectTheReason from '@salesforce/label/c.quantic_SelectTheReason';
import sendFeedback from '@salesforce/label/c.quantic_SendFeedback';
import whatWasTheReason from '@salesforce/label/c.quantic_WhatWasTheReason';
import yourResponsesHelp from '@salesforce/label/c.quantic_YourResponsesHelp';
import LightningModal from 'lightning/modal';
import {api} from 'lwc';
// @ts-ignore
import feedbackFormTemplate from './feedbackForm.html';
// @ts-ignore
import feedbackSuccessTemplate from './feedbackSuccess.html';

export default class QuanticFeedbackModal extends LightningModal {
  /**
   * The list of options to be displayed in the modal.
   * @type {Array<{label: string, value: string}>}
   */
  @api options;

  labels = {
    done,
    cancel,
    sendFeedback,
    explainWhy,
    selectOneOfOptions,
    selectTheReason,
    whatWasTheReason,
    fillOutField,
    yourResponsesHelp,
  };

  /** @type {string} */
  optionsValue;
  /** @type {string} */
  detailsValue;
  /** @type {boolean} */
  feedbackSubmitted = false;
  /** @type {boolean} */
  detailsInputError = false;

  /**
   * Closes the modal.
   * @returns {void}
   */
  closeModal() {
    this.close();
  }

  /**
   * Returns the lightning-radio-group element.
   * @returns {{setCustomValidity: function, reportValidity: function}}
   */
  get optionsInput() {
    return this.template.querySelector('lightning-radio-group');
  }

  /**
   * Returns the CSS class of the reason input.
   */
  get detailsFormClass() {
    return `slds-form-element ${this.reasonInputError ? 'slds-has-error' : ''}`;
  }

  /**
   * Handles the option change.
   * @param {CustomEvent} event
   */
  handleOptionChange(event) {
    this.reasonInputError = false;
    this.optionsInput.setCustomValidity();
    this.optionsInput.reportValidity();
    this.optionsValue = event.detail.value;
  }

  /**
   * Handles the reason change.
   * @param {CustomEvent} event
   */
  handleDetailsChange(event) {
    this.reasonInputError = false;
    this.reasonValue = event.target.value;
  }

  /**
   * Indicates whether the reason input should be displayed.
   * @returns {boolean}
   */
  get displayDetailsInput() {
    return this.optionsValue === 'other';
  }

  /**
   * Indicates whether the feedback form is valid.
   * @returns {boolean}
   */
  get feedbackFormIsValid() {
    return (
      (this.optionsValue === 'other' && !!this.reasonValue) ||
      (!!this.optionsValue && this.optionsValue !== 'other')
    );
  }

  /**
   * Submits the feedback.
   * @returns {void}
   */
  submitFeedback() {
    if (this.feedbackFormIsValid) {
      this.feedbackSubmitted = true;
    } else {
      if (this.optionsValue === 'other') {
        this.reasonInputError = true;
      } else {
        this.optionsInput.setCustomValidity(this.labels.selectOneOfOptions);
        this.optionsInput.reportValidity();
      }
    }
  }

  /**
   * Returns the right HTML template.
   */
  render() {
    if (this.feedbackSubmitted) {
      return feedbackSuccessTemplate;
    }
    return feedbackFormTemplate;
  }
}
