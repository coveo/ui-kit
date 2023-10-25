import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const generatedAnswerComponent = 'c-quantic-generated-answer';

export interface GeneratedAnswerSelector extends ComponentSelector {
  generatedAnswerCard: () => CypressSelector;
  generatedAnswer: () => CypressSelector;
  likeButton: () => CypressSelector;
  dislikeButton: () => CypressSelector;
  citations: () => CypressSelector;
  citationTitle: (index: number) => CypressSelector;
  citationIndex: (index: number) => CypressSelector;
  citationLink: (index: number) => CypressSelector;
  retryButton: () => CypressSelector;
  toggleGeneratedAnswerButton: () => CypressSelector;
  generatedAnswerContent: () => CypressSelector;
  feedbackModal: () => CypressSelector;
  feedbackOption: (index: number) => CypressSelector;
  feedbackSubmitButton: () => CypressSelector;
  feedbackCancelButton: () => CypressSelector;
  feedbackDoneButton: () => CypressSelector;
  feedbackDetailsInput: () => CypressSelector;
  rephraseButtons: () => CypressSelector;
  rephraseLabel: () => CypressSelector;
  rephraseButton: (label: string) => CypressSelector;
  generatedAnswerFooter: () => CypressSelector;
}

export const GeneratedAnswerSelectors: GeneratedAnswerSelector = {
  get: () => cy.get(generatedAnswerComponent),

  generatedAnswerCard: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="generated-answer__card"]'),
  generatedAnswer: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="generated-answer__answer"]'),
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
  toggleGeneratedAnswerButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__toggle-button"]'
    ),
  generatedAnswerContent: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__content"]'
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
  rephraseButtons: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__rephrase-buttons"]'
    ),
  rephraseLabel: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="rephrase-buttons__label"]'),
  rephraseButton: (name: string) =>
    GeneratedAnswerSelectors.get().find(
      `[data-cy="rephrase-buttons__content"] c-quantic-stateful-button[data-cy="${name}"] button`
    ),
  generatedAnswerFooter: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="generated-answer__footer"]'),
};
