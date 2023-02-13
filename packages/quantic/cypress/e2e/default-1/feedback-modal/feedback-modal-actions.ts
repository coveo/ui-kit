import {
  FeedbackModalSelector,
  FeedbackModalSelectors,
} from './feedback-modal-selectors';

function feedbackModalActions(selector: FeedbackModalSelector) {
  return {
    clickSubmit: () =>
      selector
        .submitButton()
        .click()
        .logAction('When clicking on the submit button'),

    clickCancel: () =>
      selector
        .cancelButton()
        .click()
        .logAction('When clicking on the cancel button'),

    clickDone: () =>
      selector
        .doneButton()
        .click()
        .logAction('When clicking on the done button'),

    clickOption: (idx: number) =>
      selector
        .option(idx)
        .click({force: true})
        .logAction(`When clicking the option at the index ${idx}`),

    typeInDetailsInput: (text: string) =>
      selector
        .detailsInput()
        .type(text)
        .logAction('When typing in the details input'),
  };
}

export const FeedbackModalActions = {
  ...feedbackModalActions(FeedbackModalSelectors),
};
