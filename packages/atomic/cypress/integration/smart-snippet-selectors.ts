export const smartSnippetComponent = 'atomic-smart-snippet';
export const SmartSnippetSelectors = {
  shadow: () => cy.get(smartSnippetComponent).shadow(),
  accessibilityHeading: () =>
    SmartSnippetSelectors.shadow().find('.accessibility-only'),
  smartSnippet: () =>
    SmartSnippetSelectors.shadow().find('[part="smart-snippet"]').first(),
  question: () =>
    SmartSnippetSelectors.shadow().find('[part="question"]').first(),
  answer: () => SmartSnippetSelectors.shadow().find('[part="answer"]').first(),
  sourceUrl: () =>
    SmartSnippetSelectors.shadow().find('[part="source-url"] a').first(),
  sourceTitle: () =>
    SmartSnippetSelectors.shadow().find('[part="source-title"] a').first(),
  footer: () => SmartSnippetSelectors.shadow().find('[part="footer"]').first(),
  feedbackBanner: () =>
    SmartSnippetSelectors.shadow().find('[part="feedback-banner"]', {
      includeShadowDom: true,
    }),
  feedbackInquiryAndButtons: () =>
    SmartSnippetSelectors.shadow().find(
      '[part="feedback-inquiry-and-buttons"]',
      {includeShadowDom: true}
    ),
  feedbackInquiry: () =>
    SmartSnippetSelectors.shadow().find('[part="feedback-inquiry"]', {
      includeShadowDom: true,
    }),
  feedbackButtons: () =>
    SmartSnippetSelectors.shadow().find('[part="feedback-buttons"]', {
      includeShadowDom: true,
    }),
  feedbackLikeButton: () =>
    SmartSnippetSelectors.shadow().find('[part="feedback-like-button"]', {
      includeShadowDom: true,
    }),
  feedbackDislikeButton: () =>
    SmartSnippetSelectors.shadow().find('[part="feedback-dislike-button"]', {
      includeShadowDom: true,
    }),
  feedbackThankYou: () =>
    SmartSnippetSelectors.shadow().find('[part="feedback-thank-you"]', {
      includeShadowDom: true,
    }),
};
