import {should} from '../../common-selectors';
import {ConsoleExpectations} from '../../console-expectations';
import {
  FeedbackModalSelector,
  FeedbackModalSelectors,
} from './feedback-modal-selectors';

function feedbackModalExpectations(selector: FeedbackModalSelector) {
  return {
    displayModal: (display: boolean) => {
      selector
        .get()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the feedback modal.`);
    },

    displayErrorInOptionsInput: (display: boolean) => {
      selector
        .optionsInput()
        .should('exist')
        .should(display ? 'have.class' : 'not.have.class', 'slds-has-error')
        .logDetail(
          `${should(display)} display an error message on the options input.`
        );
    },

    displayDetailsInput: (display: boolean) => {
      selector
        .detailsInput()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the details input.`);
    },

    displayErrorInDetailsInput: (display: boolean) => {
      selector
        .detailsInput()
        .should('exist')
        .should(display ? 'have.class' : 'not.have.class', 'slds-has-error')
        .logDetail(
          `${should(display)} display an error message on the details input.`
        );
    },

    displaySuccessMessage: (display: boolean) => {
      selector
        .successMessage()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the success message.`);
    },

    displayOptions: (options: Array<{value: string; label: string}>) => {
      options.forEach(({value, label}, idx) => {
        selector
          .optionLabel(idx)
          .should('have.text', label)
          .logDetail('should display the options with the right labels.');
        selector
          .option(idx)
          .should('have.value', value)
          .logDetail('should display the options with the right values.');
      });
    },

    displayErrorMessage: (display: boolean) => {
      selector
        .errorMessage()
        .should(display ? 'exist' : 'not.exist')
        .logDetail(`${should(display)} display the error message.`);
    },
  };
}

export const FeedbackModalExpectations = {
  ...feedbackModalExpectations(FeedbackModalSelectors),
  console: {
    ...ConsoleExpectations,
  },
};
