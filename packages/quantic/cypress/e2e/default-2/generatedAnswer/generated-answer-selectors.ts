import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const generatedAnswerComponent = 'c-quantic-generated-answer';

export interface GeneratedAnswerSelector extends ComponentSelector {
  generatedAnswerCard: () => CypressSelector;
  generatedAnswerContent: () => CypressSelector;
  likeButton: () => CypressSelector;
  dislikeButton: () => CypressSelector;
  citations: () => CypressSelector;
  citationTitle: (index: number) => CypressSelector;
  citationIndex: (index: number) => CypressSelector;
  citationLink: (index: number) => CypressSelector;
  retryButton: () => CypressSelector;
  feedbackModal: () => CypressSelector;
  feedbackOption: (index: number) => CypressSelector;
  feedbackSubmitButton: () => CypressSelector;
  feedbackCancelButton: () => CypressSelector;
  feedbackDoneButton: () => CypressSelector;
  feedbackDetailsInput: () => CypressSelector;
}

export const GeneratedAnswerSelectors: GeneratedAnswerSelector = {
  get: () => cy.get(generatedAnswerComponent),

  generatedAnswerCard: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="generated-answer__card"]'),
  generatedAnswerContent: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__content"]'
    ),
  likeButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__feedback"] [data-cy="feedback__like-button"]'
    ),
  dislikeButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__feedback"] [data-cy="feedback__dislike-button"]'
    ),
  citations: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__citations"]'
    ),
  citationTitle: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find('[data-cy="generated-answer__citations"] .citation__title')
      .eq(index),

  citationIndex: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find('[data-cy="generated-answer__citations"] .citation__index')
      .eq(index),

  citationLink: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find('[data-cy="generated-answer__citations"] .citation__badge')
      .eq(index),
  retryButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__retry-button"]'
    ),
  feedbackModal: () => cy.get('lightning-modal'),
  feedbackOption: (index: number) =>
    cy.get('lightning-modal').find('lightning-radio-group input').eq(index),
  feedbackSubmitButton: () =>
    cy.get('lightning-modal').find('[data-cy="feedback-modal-footer__submit"]'),
  feedbackCancelButton: () =>
    cy.get('lightning-modal').find('[data-cy="feedback-modal-footer__cancel"]'),
  feedbackDoneButton: () =>
    cy.get('lightning-modal').find('[data-cy="feedback-modal-footer__done"]'),
  feedbackDetailsInput: () =>
    cy
      .get('lightning-modal')
      .find('[data-cy="feedback-modal-body__details-input"] textarea'),
};
