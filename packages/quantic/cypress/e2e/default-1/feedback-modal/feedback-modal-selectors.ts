import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const modalComponent = 'lightning-modal';

export interface FeedbackModalSelector extends ComponentSelector {
  submitButton: () => CypressSelector;
  cancelButton: () => CypressSelector;
  doneButton: () => CypressSelector;
  optionsInput: () => CypressSelector;
  option: (idx: number) => CypressSelector;
  optionLabel: (idx: number) => CypressSelector;
  detailsInput: () => CypressSelector;
  successMessage: () => CypressSelector;
  errorMessage: () => CypressSelector;
}

export const FeedbackModalSelectors: FeedbackModalSelector = {
  get: () => cy.get(modalComponent),

  submitButton: () =>
    FeedbackModalSelectors.get().find(
      '[data-cy="feedback-modal-footer__submit"]'
    ),
  cancelButton: () =>
    FeedbackModalSelectors.get().find(
      '[data-cy="feedback-modal-footer__cancel"]'
    ),
  doneButton: () =>
    FeedbackModalSelectors.get().find(
      '[data-cy="feedback-modal-footer__done"]'
    ),
  optionsInput: () =>
    FeedbackModalSelectors.get().find('lightning-radio-group'),
  option: (idx: number) =>
    FeedbackModalSelectors.optionsInput().find('input').eq(idx),
  optionLabel: (idx: number) =>
    FeedbackModalSelectors.optionsInput().find('label').eq(idx),
  detailsInput: () =>
    FeedbackModalSelectors.get().find(
      '[data-cy="feedback-modal-body__details-input"]'
    ),
  successMessage: () =>
    FeedbackModalSelectors.get().find(
      '[data-cy="feedback-modal-body__success-message"]'
    ),
  errorMessage: () =>
    FeedbackModalSelectors.get().find('[data-cy="feedback-modal-body__error"]'),
};
