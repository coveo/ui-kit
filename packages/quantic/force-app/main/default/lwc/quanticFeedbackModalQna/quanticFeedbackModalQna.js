// @ts-nocheck
import done from '@salesforce/label/c.quantic_Done';
import feedbackHelpUsImprove from '@salesforce/label/c.quantic_FeedbackHelpUsImprove';
import sendFeedback from '@salesforce/label/c.quantic_SendFeedback';
import skip from '@salesforce/label/c.quantic_Skip';
import thankYouForYourFeedback from '@salesforce/label/c.quantic_ThankYouForYourFeedback';
import yourFeedbackHelps from '@salesforce/label/c.quantic_YourFeedbackHelps';
import requiredFeedbackQuestion from '@salesforce/label/c.quantic_requiredFeedbackQuestion';
import LightningModal from 'lightning/modal';
import {api} from 'lwc';
import feedbackFormTemplate from './quanticFeedbackModalQna.html';
import successTemplate from './success.html';

/** @typedef {"yes"|"unknown"|"no"} GeneratedAnswerFeedbackOption */

/**
 * The `QuanticFeedbackModalQna` component overlays a message modal on top of the current app window, the modal contains a form that allows the user to give feedback on a CRGA response.
 *
 * Under the hood, the component relies on a [`lightningModal`](https://developer.salesforce.com/docs/component-library/bundle/lightning-modal/documentation) component.
 * For an example of how to use the `QuanticFeedbackModal` component, see the [`quanticSmartSnippet`](https://github.com/coveo/ui-kit/blob/master/packages/quantic/force-app/main/default/lwc/quanticSmartSnippet/quanticSmartSnippet.js) implementation.
 *
 * @category Search
 * @category Insight Panel
 */
export default class QuanticFeedbackModalQna extends LightningModal {
  labels = {
    skip,
    done,
    sendFeedback,
    feedbackHelpUsImprove,
    requiredFeedbackQuestion,
    thankYouForYourFeedback,
    yourFeedbackHelps,
  };

  /**
   * @api
   * The function that will be executed when the feedback is submitted.
   * @type {function}
   */
  @api handleSubmit;

  /**
   * @api
   * If the feedback modal was opened on the thumbs up. (otherwise it was on a thumbs down).
   * @type {boolean}
   */
  @api liked;

  /** @type {boolean} */
  isFeedbackSubmitted = false;
  /** @type {GeneratedAnswerFeedbackOption} */
  correctTopicValue;
  /** @type {GeneratedAnswerFeedbackOption} */
  hallucinationFreeValue;
  /** @type {GeneratedAnswerFeedbackOption} */
  documentedValue;
  /** @type {GeneratedAnswerFeedbackOption} */
  readableValue;
  /** @type {string} */
  documentUrlValue;
  /** @type {string} */
  detailsValue;

  questions = [
    {
      question: 'Is the answer about the right topic?',
      changeFn: (event) => {
        this.correctTopicValue = event.target.value;
      },
      id: 'correctTopic',
    },
    {
      question: 'Is the answer free of hallucinated content?',
      changeFn: (event) => {
        this.hallucinationFreeValue = event.target.value;
      },
      id: 'hallucinationFree',
    },
    {
      question: 'Can the question be answered by the documentation?',
      changeFn: (event) => {
        this.documentedValue = event.target.value;
      },
      id: 'documented',
    },
    {
      question: 'Is the answer readable?',
      changeFn: (event) => {
        this.readableValue = event.target.value;
      },
      id: 'readable',
    },
  ];

  answerOptions = [
    {label: 'Yes', value: 'yes'},
    {label: 'Not sure', value: 'unknown'},
    {label: 'No', value: 'no'},
  ];

  /** @type {string} */
  error;

  /**
   * Closes the modal.
   * @returns {void}
   */
  closeModal() {
    this.close();
  }

  get feedbackQuestionsRadios() {
    return this.template.querySelectorAll('lightning-radio-group');
  }

  get feedbackFormIsValid() {
    let valid = true;
    const feedbackQuestions = this.feedbackQuestionsRadios;
    feedbackQuestions.forEach((question) => {
      if (question?.checkValidity() !== true) {
        valid = false;
      }
    });
    return valid;
  }

  documentUrlChangeHandler(event) {
    this.documentUrlValue = event?.target?.value;
  }

  detailsChangeHandler(event) {
    this.detailsValue = event?.target?.value;
  }

  /**
   * Submits the feedback.
   * @returns {void}
   */
  handleSubmitFeedback() {
    if (!this.feedbackFormIsValid) {
      this.feedbackQuestionsRadios.forEach((question) => {
        question.reportValidity();
      });
      return;
    }
    this.handleSubmit({
      correctTopicValue: this.correctTopicValue,
      hallucinationFree: this.hallucinationFreeValue,
      documented: this.documentedValue,
      readable: this.readableValue,
      documentUrl: this.documentUrlValue,
      details: this.detailsValue,
      helpful: this.liked,
    });
    this.isFeedbackSubmitted = true;
    // this.handleSubmit({
    //   value: this.feedbackValue,
    //   details: this.detailsValue,
    // });
  }

  /**
   * Returns the right HTML template.
   */
  render() {
    if (this.isFeedbackSubmitted) {
      return successTemplate;
    }
    return feedbackFormTemplate;
  }
}
