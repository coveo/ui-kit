// @ts-nocheck
import cancel from '@salesforce/label/c.quantic_Cancel';
import done from '@salesforce/label/c.quantic_Done';
import explainWhy from '@salesforce/label/c.quantic_ExplainWhy';
import fillOutField from '@salesforce/label/c.quantic_FillOutField';
import selectOneOfOptions from '@salesforce/label/c.quantic_SelectOneOfOptions';
import selectTheReason from '@salesforce/label/c.quantic_SelectTheReason';
import sendFeedback from '@salesforce/label/c.quantic_SendFeedback';
import thankYouForYourFeedback from '@salesforce/label/c.quantic_ThankYouForYourFeedback';
import whatWasTheReason from '@salesforce/label/c.quantic_WhatWasTheReason';
import yourResponsesHelp from '@salesforce/label/c.quantic_YourResponsesHelp';
import {getBueno} from 'c/quanticHeadlessLoader';
import LightningModal from 'lightning/modal';
import {api} from 'lwc';
import errorTemplate from './error.html';
import feedbackFormTemplate from './feedbackForm.html';
import successTemplate from './success.html';

export default class QuanticFeedbackModal extends LightningModal {
  /**
   * @api
   * The list of options to be displayed in the modal.
   * @type {Array<{label: string, value: string}>}
   */
  @api options;
  /**
   * @api
   * The function that will be executed when the feedback is submitted.
   * @type {(feedback: {value: string, details: string}) => void}
   */
  @api submitFeedback;

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
    thankYouForYourFeedback,
  };

  /** @type {string} */
  optionsValue;
  /** @type {string} */
  detailsValue;
  /** @type {boolean} */
  feedbackSubmitted = false;
  /** @type {boolean} */
  detailsInputError = false;
  /** @type {string} */
  error;
  /** @type {boolean} */
  validated = false;

  connectedCallback() {
    this.validateFeedbackModal();
  }

  /**
   * Validates the properties provided to the feedback moda.
   */
  validateFeedbackModal() {
    getBueno(this).then(() => {
      this.validateOptionList();
      if (!this.error) {
        this.validateOptions();
      }
      this.validated = true;
    });
  }

  validateOptionList() {
    if (!Bueno.isArray(this.options)) {
      console.error('The options provided are not in a valid table.');
      this.setError();
    } else if (!this.options.length) {
      console.error('At least one option must be specified.');
      this.setError();
    }
  }

  validateOptions() {
    const missingValueOrLabel = this.options?.some(
      ({value, label}) => !value || !label
    );
    if (missingValueOrLabel) {
      console.error(
        'In the c-quantic-feedback-modal, each option requires a label and a value to be specified.'
      );
      this.setError();
    } else {
      this.options.forEach(({value, label}) => {
        if (!Bueno.isString(value)) {
          console.error(`The "${value}" value is not a valid string.`);
          this.setError();
        }
        if (!Bueno.isString(label)) {
          console.error(`The "${label}" label is not a valid string.`);
          this.setError();
        }
      });
    }
  }

  setError() {
    this.error = 'c-quantic-feedback-modal Error';
  }

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
    return `slds-form-element ${
      this.detailsInputError ? 'slds-has-error' : ''
    }`;
  }

  /**
   * Handles the option change.
   * @param {CustomEvent} event
   */
  handleOptionChange(event) {
    this.detailsInputError = false;
    this.optionsInput.setCustomValidity();
    this.optionsInput.reportValidity();
    this.optionsValue = event.detail.value;
  }

  /**
   * Handles the details input change.
   * @param {CustomEvent} event
   */
  handleDetailsChange(event) {
    this.detailsInputError = false;
    this.detailsValue = event.target.value;
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
      (this.optionsValue === 'other' && !!this.detailsValue) ||
      (!!this.optionsValue && this.optionsValue !== 'other')
    );
  }

  /**
   * Submits the feedback.
   * @returns {void}
   */
  handleSubmitFeedback() {
    if (this.feedbackFormIsValid) {
      this.submitFeedback({
        value: this.optionsValue,
        details: this.detailsValue,
      });
      this.feedbackSubmitted = true;
    } else {
      if (this.optionsValue === 'other') {
        this.detailsInputError = true;
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
    if (this.error) {
      return errorTemplate;
    } else if (this.feedbackSubmitted) {
      return successTemplate;
    }
    return feedbackFormTemplate;
  }
}
