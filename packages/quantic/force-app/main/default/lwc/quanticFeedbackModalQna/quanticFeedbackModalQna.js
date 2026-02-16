import done from '@salesforce/label/c.quantic_Done';
import additionalNotes from '@salesforce/label/c.quantic_FeedbackAdditionalNotes';
import additionalNotesExplanation from '@salesforce/label/c.quantic_FeedbackAdditionalNotesExplanation';
import answerEvaluation from '@salesforce/label/c.quantic_FeedbackAnswerEvaluation';
import documentUrl from '@salesforce/label/c.quantic_FeedbackDocumentUrl';
import documentUrlExplanation from '@salesforce/label/c.quantic_FeedbackDocumentUrlExplanation';
import helpUsImprove from '@salesforce/label/c.quantic_FeedbackHelpUsImprove';
import answerNotSure from '@salesforce/label/c.quantic_FeedbackNotSure';
import questionDocumented from '@salesforce/label/c.quantic_FeedbackQuestionDocumented';
import questionHallucination from '@salesforce/label/c.quantic_FeedbackQuestionHallucination';
import questionReadable from '@salesforce/label/c.quantic_FeedbackQuestionReadable';
import questionTopic from '@salesforce/label/c.quantic_FeedbackQuestionTopic';
import answerNo from '@salesforce/label/c.quantic_No';
import sendFeedback from '@salesforce/label/c.quantic_SendFeedback';
import skip from '@salesforce/label/c.quantic_Skip';
import thankYouForYourFeedback from '@salesforce/label/c.quantic_ThankYouForYourFeedback';
import answerYes from '@salesforce/label/c.quantic_Yes';
import yourFeedbackHelps from '@salesforce/label/c.quantic_YourFeedbackHelps';
import requiredFeedbackQuestion from '@salesforce/label/c.quantic_requiredFeedbackQuestion';
import requiredFields from '@salesforce/label/c.quantic_requiredFields';
// @ts-ignore
import LightningModal from 'lightning/modal';
import {api} from 'lwc';
// @ts-ignore
import feedbackFormTemplate from './templates/quanticFeedbackModalQna.html';
// @ts-ignore
import successTemplate from './templates/success.html';

/** @typedef {"yes"|"unknown"|"no"} GeneratedAnswerFeedbackOption */

/**
 * The `QuanticFeedbackModalQna` component overlays a message modal on top of the current app window, the modal contains a form that allows the user to give feedback on a CRGA response.
 *
 * Under the hood, the component relies on a [`lightningModal`](https://developer.salesforce.com/docs/component-library/bundle/lightning-modal/documentation) component.
 * For an example of how to use the `QuanticFeedbackModalQna` component, see the [`quanticGeneratedAnswer`](https://github.com/coveo/ui-kit/blob/main/packages/quantic/force-app/main/default/lwc/quanticGeneratedAnswer/quanticGeneratedAnswer.js) implementation.
 *
 * @category Search
 * @category Insight Panel
 */
export default class QuanticFeedbackModalQna extends LightningModal {
  labels = {
    skip,
    done,
    sendFeedback,
    helpUsImprove,
    requiredFeedbackQuestion,
    requiredFields,
    thankYouForYourFeedback,
    answerEvaluation,
    questionTopic,
    questionHallucination,
    questionDocumented,
    questionReadable,
    yourFeedbackHelps,
    answerYes,
    answerNo,
    answerNotSure,
    documentUrl,
    documentUrlExplanation,
    additionalNotes,
    additionalNotesExplanation,
  };

  /**
   * @api
   * The function that will be executed when the feedback is submitted.
   * @type {function}
   */
  @api handleSubmit;

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
      question: this.labels.questionTopic,
      changeFn: (event) => {
        this.correctTopicValue = event.target.value;
      },
      id: 'correctTopic',
    },
    {
      question: this.labels.questionHallucination,
      changeFn: (event) => {
        this.hallucinationFreeValue = event.target.value;
      },
      id: 'hallucinationFree',
    },
    {
      question: this.labels.questionDocumented,
      changeFn: (event) => {
        this.documentedValue = event.target.value;
      },
      id: 'documented',
    },
    {
      question: this.labels.questionReadable,
      changeFn: (event) => {
        this.readableValue = event.target.value;
      },
      id: 'readable',
    },
  ];

  answerOptions = [
    {label: this.labels.answerYes, value: 'yes'},
    {label: this.labels.answerNotSure, value: 'unknown'},
    {label: this.labels.answerNo, value: 'no'},
  ];

  /** @type {string} */
  error;

  /**
   * Closes the modal.
   * @returns {void}
   */
  closeModal() {
    // @ts-ignore
    this.close();
  }

  findFeedbackQuestionsRadios() {
    // @ts-ignore
    return this.template.querySelectorAll('lightning-radio-group');
  }

  get feedbackFormIsValid() {
    let valid = true;
    const feedbackQuestions = this.findFeedbackQuestionsRadios();
    feedbackQuestions.forEach((question) => {
      if (question?.checkValidity() !== true) {
        valid = false;
      }
    });
    return valid;
  }

  documentUrlChangeHandler(event) {
    this.documentUrlValue = event.target.value;
  }

  detailsChangeHandler(event) {
    this.detailsValue = event.target.value;
  }

  /**
   * Submits the feedback.
   * @returns {void}
   */
  handleSubmitFeedback() {
    if (!this.feedbackFormIsValid) {
      this.findFeedbackQuestionsRadios().forEach((question) => {
        question.reportValidity();
      });
      return;
    }
    this.handleSubmit({
      correctTopic: this.correctTopicValue,
      hallucinationFree: this.hallucinationFreeValue,
      documented: this.documentedValue,
      readable: this.readableValue,
      documentUrl: this.documentUrlValue,
      details: this.detailsValue,
    });
    this.isFeedbackSubmitted = true;
  }

  render() {
    if (this.isFeedbackSubmitted) {
      return successTemplate;
    }
    return feedbackFormTemplate;
  }
}
