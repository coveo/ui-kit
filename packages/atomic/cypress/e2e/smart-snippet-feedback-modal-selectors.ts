export const smartSnippetFeedbackModalComponent =
  'atomic-smart-snippet-feedback-modal';
export const SmartSnippetFeedbackModalSelectors = {
  shadow: () => cy.get(smartSnippetFeedbackModalComponent).shadow(),
  backdrop: () =>
    SmartSnippetFeedbackModalSelectors.shadow().find('[part="backdrop"]', {
      includeShadowDom: true,
    }),
  container: () =>
    SmartSnippetFeedbackModalSelectors.shadow().find('[part="container"]', {
      includeShadowDom: true,
    }),
  reasonRadio: () =>
    SmartSnippetFeedbackModalSelectors.shadow().find('[part="reason-radio"]', {
      includeShadowDom: true,
    }),
  detailsInput: () =>
    SmartSnippetFeedbackModalSelectors.shadow().find('[part="details-input"]', {
      includeShadowDom: true,
    }),
  cancelButton: () =>
    SmartSnippetFeedbackModalSelectors.shadow().find('[part="cancel-button"]', {
      includeShadowDom: true,
    }),
  submitButton: () =>
    SmartSnippetFeedbackModalSelectors.shadow().find('[part="submit-button"]', {
      includeShadowDom: true,
    }),
  invalidInputs: () =>
    SmartSnippetFeedbackModalSelectors.shadow().find(':invalid', {
      includeShadowDom: true,
    }),
};
