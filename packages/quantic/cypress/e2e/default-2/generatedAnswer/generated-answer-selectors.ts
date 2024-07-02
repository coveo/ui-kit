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
  generatedAnswerContentContainer: () => CypressSelector;
  feedbackModal: () => CypressSelector;
  feedbackOption: (index: number) => CypressSelector;
  feedbackSubmitButton: () => CypressSelector;
  feedbackCancelButton: () => CypressSelector;
  feedbackDoneButton: () => CypressSelector;
  feedbackDetailsInput: () => CypressSelector;
  rephraseButtons: () => CypressSelector;
  rephraseLabel: () => CypressSelector;
  rephraseButtonByLabel: (label: string) => CypressSelector;
  generatedAnswerFooterRow: () => CypressSelector;
  copyToClipboardButton: () => CypressSelector;
  citationTooltip: (index: number) => CypressSelector;
  citationTooltipUri: (index: number) => CypressSelector;
  citationTooltipTitle: (index: number) => CypressSelector;
  citationTooltipText: (index: number) => CypressSelector;
  disclaimer: () => CypressSelector;
  toggleCollapseButton: () => CypressSelector;
  generatingMessage: () => CypressSelector;
}

export const GeneratedAnswerSelectors: GeneratedAnswerSelector = {
  get: () => cy.get(generatedAnswerComponent),

  generatedAnswerCard: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="generated-answer__card"]'),
  generatedAnswer: () =>
    GeneratedAnswerSelectors.get().find('[data-cy="generated-answer__answer"]'),
  likeButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__feedback"] c-quantic-stateful-button[data-cy="feedback__like-button"] button'
    ),
  dislikeButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__feedback"] c-quantic-stateful-button[data-cy="feedback__dislike-button"] button'
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
      .find('[data-cy="generated-answer__citations"] .citation__link')
      .eq(index),
  retryButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__retry-button"]'
    ),
  toggleGeneratedAnswerButton: () =>
    GeneratedAnswerSelectors.get().find(
      'c-quantic-generated-answer-toggle [data-cy="generated-answer__toggle-button"]'
    ),
  generatedAnswerContent: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__content"]'
    ),
  generatedAnswerContentContainer: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__content-container"]'
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
    GeneratedAnswerSelectors.get().find(
      'legend[data-cy="radio-buttons-group__legend"]'
    ),
  rephraseButtonByLabel: (label: string) =>
    GeneratedAnswerSelectors.get().find(
      `c-quantic-radio-buttons-group [data-cy="${label}"]`
    ),
  generatedAnswerFooterRow: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__footer-row"]'
    ),
  copyToClipboardButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__copy-to-clipboard"]'
    ),
  citationTooltip: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find('[data-cy="generated-answer__citations"] [data-cy="tooltip"]')
      .eq(index),
  citationTooltipUri: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find(
        '[data-cy="generated-answer__citations"] [data-cy="citation__tooltip-uri"]'
      )
      .eq(index),
  citationTooltipTitle: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find(
        '[data-cy="generated-answer__citations"] [data-cy="citation__tooltip-title"]'
      )
      .eq(index),

  citationTooltipText: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find(
        '[data-cy="generated-answer__citations"] [data-cy="citation__tooltip-text"]'
      )
      .eq(index),
  disclaimer: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__disclaimer"]'
    ),
  toggleCollapseButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-cy="generated-answer__answer-toggle"]'
    ),
  generatingMessage: () =>
    GeneratedAnswerSelectors.get().find(
      'div.generated-answer__collapse-generating-message'
    ),
};
