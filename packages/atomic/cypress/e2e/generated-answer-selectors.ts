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
    GeneratedAnswerSelectors.citation().find('.citation-index'),
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
};

export const feedbackModalSelectors = {
  shadow: () => GeneratedAnswerSelectors.shadow().find(feedbackModal).shadow(),
  atomicModal: () => feedbackModalSelectors.shadow().find('atomic-modal'),
  atomicModalShadow: () => feedbackModalSelectors.atomicModal().shadow(),
  container: () =>
    feedbackModalSelectors.atomicModalShadow().find('[part="container"]'),
  backdrop: () =>
    feedbackModalSelectors.atomicModalShadow().find('[part="backdrop"]'),
  modalBody: () => feedbackModalSelectors.atomicModal().find('[part="form"]'),
  modalHeader: () =>
    feedbackModalSelectors.atomicModal().find('[part="modalHeader"]'),
  modalFooter: () =>
    feedbackModalSelectors.atomicModal().find('[part="modalFooter"]'),
  detailsTextArea: () =>
    feedbackModalSelectors.atomicModal().find('[part="details-input"]'),
  other: () => feedbackModalSelectors.atomicModal().find('.other'),
  reason: () =>
    feedbackModalSelectors.atomicModal().find('[part="reason-radio"]'),
  submitButton: () =>
    feedbackModalSelectors.atomicModal().find('[part="submit-button"]'),
  detailsInput: () =>
    feedbackModalSelectors.shadow().find('[part="details-input"]', {
      includeShadowDom: true,
    }),
};
