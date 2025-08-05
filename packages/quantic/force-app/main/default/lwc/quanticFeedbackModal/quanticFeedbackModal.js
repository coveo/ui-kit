// @ts-nocheck
import cancel from '@salesforce/label/c.quantic_Cancel';
import done from '@salesforce/label/c.quantic_Done';
import explainWhy from '@salesforce/label/c.quantic_ExplainWhy';
import fillOutField from '@salesforce/label/c.quantic_FillOutField';
import provideDetails from '@salesforce/label/c.quantic_ProvideDetails';
import selectOneOfOptions from '@salesforce/label/c.quantic_SelectOneOfOptions';
import selectTheReason from '@salesforce/label/c.quantic_SelectTheReason';
import sendFeedback from '@salesforce/label/c.quantic_SendFeedback';
import thankYouForYourFeedback from '@salesforce/label/c.quantic_ThankYouForYourFeedback';
import yourFeedbackHelps from '@salesforce/label/c.quantic_YourFeedbackHelps';
import {getBueno} from 'c/quanticHeadlessLoader';
import LightningModal from 'lightning/modal';
import {api} from 'lwc';
import errorTemplate from './error.html';
import feedbackFormTemplate from './feedbackForm.html';
import successTemplate from './success.html';

/**
 * The `QuanticFeedbackModal` component overlays a message modal on top of the current app window, the modal contains a form that allows the user to give feedback.
 *
 * Under the hood, the component relies on a [`lightningModal`](https://developer.salesforce.com/docs/component-library/bundle/lightning-modal/documentation) component.
 * For an example of how to use the `QuanticFeedbackModal` component, see the [`quanticSmartSnippet`](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticSmartSnippet/quanticSmartSnippet.js) implementation.
 *
 * @category Search
 * @category Insight Panel
 */
export default class QuanticFeedbackModal extends LightningModal {
  labels = {
    done,
    cancel,
    sendFeedback,
    explainWhy,
    selectOneOfOptions,
    selectTheReason,
    provideDetails,
    fillOutField,
    yourFeedbackHelps,
    thankYouForYourFeedback,
  };

  /**
   * @api
   * The list of options to be displayed in the modal.
   * @type {Array<{label: string, value: string, withDetails: boolean, detailsRequired: boolean}>}
   */
  @api options;
  /**
   * @api
   * The label displayed above the options.
   * @type {string}
   */
  @api optionsLabel = this.labels.selectTheReason;
  /**
   * @api
   * The function that will be executed when the feedback is submitted.
   * @type {function}
   */
  @api handleSubmit;

  /** @type {string} */
  feedbackValue;
  /** @type {string} */
  detailsValue;
  /** @type {boolean} */
  isFeedbackSubmitted = false;
  /** @type {string} */
  error;
  /** @type {boolean} */
  isValidated = false;

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
      this.isValidated = true;
    });
  }

  validateTheOptionsProperty() {
    if (!Array.isArray(this.options) || !this.options?.length) {
      console.error('The options provided must be a non-empty array.');
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
    if (typeof this.handleSubmit !== 'function') {
      console.error('The handleSubmit property is not a valid function.');
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
   * Handles the feedback input change.
   * @param {CustomEvent} event
   */
  handleFeedbackChange(event) {
    this.feedbackInput.reportValidity();
    this.feedbackValue = event.detail.value;
  }

  /**
   * Handles the details input change.
   * @param {CustomEvent} event
   */
  handleDetailsChange(event) {
    this.detailsInput.reportValidity();
    this.detailsValue = event.detail.value;
  }

  /**
   * Submits the feedback.
   * @returns {void}
   */
  handleSubmitFeedback() {
    if (this.feedbackFormIsValid) {
      this.handleSubmit({
        value: this.feedbackValue,
        details: this.detailsValue,
      });
      this.isFeedbackSubmitted = true;
    } else {
      this.feedbackInput.reportValidity();
      this.detailsInput?.reportValidity();
    }
  }

  /**
   * Returns the lightning-radio-group element.
   */
  get feedbackInput() {
    return this.template.querySelector('lightning-radio-group');
  }

  /**
   * Returns the lightning-textarea element.
   */
  get detailsInput() {
    return this.template.querySelector('lightning-textarea');
  }

  /**
   * Returns the selected option.
   */
  get selectedOption() {
    return this.options.find((option) => option.value === this.feedbackValue);
  }

  /**
   * Indicates whether the details are required.
   * @returns {boolean}
   */
  get detailsAreRequired() {
    return !!this.selectedOption?.detailsRequired;
  }

  /**
   * Indicates whether the details input should be displayed.
   * @returns {boolean}
   */
  get shouldDisplayDetailsInput() {
    return !!this.selectedOption?.withDetails;
  }

  /**
   * Indicates whether the feedback form is valid.
   * @returns {boolean}
   */
  get feedbackFormIsValid() {
    if (!this.feedbackValue) {
      return false;
    }
    if (
      !!this.selectedOption?.withDetails &&
      !!this.detailsAreRequired &&
      !this.detailsValue
    ) {
      return false;
    }
    return true;
  }

  /**
   * Returns the right HTML template.
   */
  render() {
    if (this.error) {
      return errorTemplate;
    } else if (this.isFeedbackSubmitted) {
      return successTemplate;
    }
    return feedbackFormTemplate;
  }
}
