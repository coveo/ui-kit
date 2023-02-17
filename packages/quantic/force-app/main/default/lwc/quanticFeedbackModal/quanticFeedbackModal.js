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

/**
 * The `QuanticFeedbackModal` component overlays a message modal on top of the current app window, the modal contains a form that allows the user to give feedback.
 *
 * @category Search
 * @category Insight Panel
 */
export default class QuanticFeedbackModal extends LightningModal {
  /**
   * @api
   * The list of options to be displayed in the modal.
   * @type {Array<{label: string, value: string, withDetails: boolean, detailsRequired: boolean}>}
   */
  @api options;
  /**
   * @api
   * The function that will be executed when the feedback is submitted.
   * @type {function}
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
  feedbackValue;
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
   * Validates the properties provided to the feedback modal.
   */
  validateFeedbackModal() {
    getBueno(this).then(() => {
      this.validateTheOptionsProperty();
      if (!this.error) {
        this.validateOptions();
      }
      if (!this.error) {
        this.validateTheSubmitFeedbackProperty();
      }
      this.validated = true;
    });
  }

  validateTheOptionsProperty() {
    if (!Bueno.isArray(this.options)) {
      console.error('The options provided are not in a valid array.');
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
        'Each option requires a label and a value to be specified.'
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

  validateTheSubmitFeedbackProperty() {
    if (typeof this.submitFeedback !== 'function') {
      console.error('The submitFeedback property is not a valid function.');
      this.setError();
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
    this.feedbackValue = event.detail.value;
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
   * Indicates whether the details input should be displayed.
   * @returns {boolean}
   */
  get displayDetailsInput() {
    const selectedOption = this.options.find(
      (option) => option.value === this.feedbackValue
    );
    return !!selectedOption?.withDetails;
  }

  /**
   * Indicates whether the feedback form is valid.
   * @returns {boolean}
   */
  get feedbackFormIsValid() {
    if(!this.feedbackValue){
      return false;
    }
    const selectedOption = this.options.find(
      (option) => option.value === this.feedbackValue
    );
    if(!!selectedOption?.withDetails && !!selectedOption.detailsRequired && !this.detailsValue){
      return false;
    }
    return true;
  }

  /**
   * Submits the feedback.
   * @returns {void}
   */
  handleSubmitFeedback() {
    if (this.feedbackFormIsValid) {
      this.submitFeedback({
        value: this.feedbackValue,
        details: this.detailsValue,
      });
      this.feedbackSubmitted = true;
    } else {
      if (!this.feedbackValue) {
        this.optionsInput.setCustomValidity(this.labels.selectOneOfOptions);
        this.optionsInput.reportValidity();
      } else {
        this.detailsInputError = true;
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
