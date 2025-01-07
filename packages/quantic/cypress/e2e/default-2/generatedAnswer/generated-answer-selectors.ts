import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const generatedAnswerComponent = 'c-quantic-generated-answer';

export interface GeneratedAnswerSelector extends ComponentSelector {
  generatedAnswerCard: () => CypressSelector;
  generatedAnswer: () => CypressSelector;
  likeButton: () => CypressSelector;
  dislikeButton: () => CypressSelector;
  citations: () => CypressSelector;
  citationTitle: (index: number) => CypressSelector;
  citationLink: (index: number) => CypressSelector;
  retryButton: () => CypressSelector;
  toggleGeneratedAnswerButton: () => CypressSelector;
  generatedAnswerContent: () => CypressSelector;
  generatedAnswerContentContainer: () => CypressSelector;
  feedbackModal: () => CypressSelector;
  feedbackSubmitButton: () => CypressSelector;
  feedbackCancelButton: () => CypressSelector;
  feedbackDoneButton: () => CypressSelector;
  feedbackDocumentUrlInput: () => CypressSelector;
  feedbackDetailsInput: () => CypressSelector;
  copyToClipboardButton: () => CypressSelector;
  citationTooltip: (index: number) => CypressSelector;
  citationTooltipUri: (index: number) => CypressSelector;
  citationTooltipTitle: (index: number) => CypressSelector;
  citationTooltipText: (index: number) => CypressSelector;
  disclaimer: () => CypressSelector;
  toggleCollapseButton: () => CypressSelector;
  generatingMessage: () => CypressSelector;
  feedbackOption: (value: string, index: number) => CypressSelector;
  successMessage: () => CypressSelector;
}

export const GeneratedAnswerSelectors: GeneratedAnswerSelector = {
  get: () => cy.get(generatedAnswerComponent),

  generatedAnswerCard: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-testid="generated-answer__card"]'
    ),
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
      '[data-testid="generated-answer__citations"]'
    ),
  citationTitle: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find('[data-testid="generated-answer__citations"] .citation__title')
      .eq(index),
  citationLink: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find('[data-testid="generated-answer__citations"] .citation__link')
      .eq(index),
  retryButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-testid="generated-answer__retry-button"]'
    ),
  toggleGeneratedAnswerButton: () =>
    GeneratedAnswerSelectors.get().find(
      'c-quantic-generated-answer-toggle [data-testid="generated-answer__toggle-button"]'
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
  feedbackSubmitButton: () =>
    GeneratedAnswerSelectors.feedbackModal().find(
      '[data-cy="feedback-modal-qna-footer__submit"]'
    ),
  feedbackCancelButton: () =>
    GeneratedAnswerSelectors.feedbackModal().find(
      '[data-cy="feedback-modal-footer__cancel"]'
    ),
  feedbackDoneButton: () =>
    GeneratedAnswerSelectors.feedbackModal().find(
      '[data-cy="feedback-modal-footer__done"]'
    ),
  feedbackDocumentUrlInput: () =>
    GeneratedAnswerSelectors.feedbackModal().find('input[name="documentUrl"]'),
  feedbackDetailsInput: () =>
    GeneratedAnswerSelectors.feedbackModal().find(
      '[data-name="details"] textarea'
    ),
  copyToClipboardButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-testid="generated-answer__copy-to-clipboard"]'
    ),
  citationTooltip: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find('[data-testid="generated-answer__citations"] [data-cy="tooltip"]')
      .eq(index),
  citationTooltipUri: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find(
        '[data-testid="generated-answer__citations"] [data-cy="citation__tooltip-uri"]'
      )
      .eq(index),
  citationTooltipTitle: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find(
        '[data-testid="generated-answer__citations"] [data-cy="citation__tooltip-title"]'
      )
      .eq(index),

  citationTooltipText: (index: number) =>
    GeneratedAnswerSelectors.get()
      .find(
        '[data-testid="generated-answer__citations"] [data-cy="citation__tooltip-text"]'
      )
      .eq(index),
  disclaimer: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-testid="generated-answer__disclaimer"]'
    ),
  toggleCollapseButton: () =>
    GeneratedAnswerSelectors.get().find(
      '[data-testid="generated-answer__answer-toggle"]'
    ),
  generatingMessage: () =>
    GeneratedAnswerSelectors.get().find(
      'div.generated-answer__collapse-generating-message'
    ),
  feedbackOption: (value: string, index: number) =>
    GeneratedAnswerSelectors.feedbackModal()
      .find(`.feedback-modal-qna__question input[value=${value}]`)
      .eq(index),
  successMessage: () =>
    GeneratedAnswerSelectors.feedbackModal().find(
      '[data-cy="feedback-modal-body__success-message"]'
    ),
};
