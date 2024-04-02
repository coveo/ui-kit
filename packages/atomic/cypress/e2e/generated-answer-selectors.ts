export const generatedAnswerComponent = 'atomic-generated-answer';
export const feedbackModal = 'atomic-generated-answer-feedback-modal';
export const GeneratedAnswerSelectors = {
  shadow: () => cy.get(generatedAnswerComponent).shadow(),
  container: () => GeneratedAnswerSelectors.shadow().find('[part="container"]'),
  content: () =>
    GeneratedAnswerSelectors.shadow().find('[part="generated-content"]'),
  answer: () =>
    GeneratedAnswerSelectors.shadow().find('[part="generated-text"]'),
  headerLabel: () =>
    GeneratedAnswerSelectors.shadow().find('[part="header-label"]'),
  likeButton: () =>
    GeneratedAnswerSelectors.shadow().find('.feedback-button.like'),
  dislikeButton: () =>
    GeneratedAnswerSelectors.shadow().find('.feedback-button.dislike'),
  citation: () => GeneratedAnswerSelectors.shadow().find('[part="citation"]'),
  citationsLabel: () =>
    GeneratedAnswerSelectors.shadow().find('[part="citations-label"]'),
  citationTitle: () =>
    GeneratedAnswerSelectors.citation().find('.citation-title'),
  citationIndex: () =>
    GeneratedAnswerSelectors.citation().find('[part="citation-index"]'),
  citationCard: () =>
    GeneratedAnswerSelectors.shadow().find('[part="citation-popover"]'),
  loader: () => GeneratedAnswerSelectors.shadow().find('.typing-indicator'),
  retryContainer: () =>
    GeneratedAnswerSelectors.shadow().find('[part="retry-container"]'),
  retryButton: () => GeneratedAnswerSelectors.retryContainer().find('button'),
  toggle: () => GeneratedAnswerSelectors.shadow().find('[part="toggle"]'),
  rephraseButton: (answerStyle: string) =>
    GeneratedAnswerSelectors.shadow()
      .find('[part="rephrase-button"]')
      .contains(answerStyle)
      .parent(),
  copyButton: () =>
    GeneratedAnswerSelectors.shadow().find('[part="copy-button"]'),
  disclaimer: () =>
    GeneratedAnswerSelectors.shadow().find('[slot="disclaimer"]'),
};

export const feedbackModalSelectors = {
  shadow: () => cy.get(feedbackModal).shadow(),
  atomicModal: () => feedbackModalSelectors.shadow().find('atomic-modal'),
  atomicModalShadow: () => feedbackModalSelectors.atomicModal().shadow(),
  container: () =>
    feedbackModalSelectors.atomicModalShadow().find('[part="container"]'),
  backdrop: () =>
    feedbackModalSelectors.atomicModalShadow().find('[part="backdrop"]'),
  modalBody: () => feedbackModalSelectors.atomicModal().find('[part="form"]'),
  modalHeader: () =>
    feedbackModalSelectors.atomicModal().find('[part="modal-header"]'),
  modalFooter: () =>
    feedbackModalSelectors.atomicModal().find('[part="modalFooter"]'),
  detailsTextArea: () =>
    feedbackModalSelectors.atomicModal().find('[part="details-input"]'),
  other: () => feedbackModalSelectors.atomicModal().find('.other'),
  reason: () =>
    feedbackModalSelectors.atomicModal().find('[part="reason-radio"]'),
  submitButton: () =>
    feedbackModalSelectors.atomicModal().find('[part="submit-button"]'),
  cancelButton: () =>
    feedbackModalSelectors.atomicModal().find('[part="cancel-button"]'),
  detailsInput: () =>
    feedbackModalSelectors.shadow().find('[part="details-input"]', {
      includeShadowDom: true,
    }),
};
