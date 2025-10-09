import {GeneratedAnswerFeedback} from '@coveo/headless';

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
  citationCard: () =>
    GeneratedAnswerSelectors.shadow().find('[part="citation-popover"]'),
  retryContainer: () =>
    GeneratedAnswerSelectors.shadow().find('[part="retry-container"]'),
  retryButton: () => GeneratedAnswerSelectors.retryContainer().find('button'),
  toggle: () => GeneratedAnswerSelectors.shadow().find('[part="toggle"]'),
  copyButton: () =>
    GeneratedAnswerSelectors.shadow().find('[part="copy-button"]'),
  disclaimer: () =>
    GeneratedAnswerSelectors.shadow().find('[slot="disclaimer"]'),
  answerContainer: () =>
    GeneratedAnswerSelectors.shadow().find('[part="generated-container"]'),
  showButton: () =>
    GeneratedAnswerSelectors.shadow().find('[part="answer-show-button"]'),
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
    feedbackModalSelectors.atomicModal().find('[part="modal-footer"]'),
  other: () => feedbackModalSelectors.atomicModal().find('.other'),
  feedbackOption: (
    feedback: keyof GeneratedAnswerFeedback,
    optionText: 'No' | 'Yes' | 'Not sure'
  ) =>
    feedbackModalSelectors
      .atomicModal()
      .find('[part="form"]')
      .find(`.${feedback}`)
      .find(`input[value=${optionText}]`),
  submitButton: () =>
    feedbackModalSelectors.atomicModal().find('[part="submit-button"]'),
  cancelButton: () =>
    feedbackModalSelectors.atomicModal().find('[part="cancel-button"]'),
  detailsInput: () =>
    feedbackModalSelectors.shadow().find('[part="details-input"]', {
      includeShadowDom: true,
    }),
};
