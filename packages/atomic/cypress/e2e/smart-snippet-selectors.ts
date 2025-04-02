export const smartSnippetComponent = 'atomic-smart-snippet';
export const SmartSnippetSelectors = {
  shadow: () => cy.get(smartSnippetComponent).shadow(),
  accessibilityHeading: () => SmartSnippetSelectors.shadow().find('.sr-only'),
  smartSnippet: () =>
    SmartSnippetSelectors.shadow().find('[part="smart-snippet"]'),
  question: () => SmartSnippetSelectors.shadow().find('[part="question"]'),
  answer: () =>
    SmartSnippetSelectors.shadow().find('[part="answer"]', {
      includeShadowDom: true,
    }),
  truncatedAnswer: () =>
    SmartSnippetSelectors.shadow().find('[part="truncated-answer"]', {
      includeShadowDom: true,
    }),
  collapseWrapperComponent: () =>
    SmartSnippetSelectors.shadow().find(
      'atomic-smart-snippet-collapse-wrapper'
    ),
  collapseWrapper: () =>
    SmartSnippetSelectors.shadow().find(
      '[part="smart-snippet-collapse-wrapper"]',
      {
        includeShadowDom: true,
      }
    ),
  showMoreButton: () =>
    SmartSnippetSelectors.shadow().find('[part="show-more-button"]', {
      includeShadowDom: true,
    }),
  showLessButton: () =>
    SmartSnippetSelectors.shadow().find('[part="show-less-button"]', {
      includeShadowDom: true,
    }),
  body: () => SmartSnippetSelectors.shadow().find('[part="body"]'),
  sourceUrl: () => SmartSnippetSelectors.shadow().find('[part="source-url"]'),
  sourceTitle: () =>
    SmartSnippetSelectors.shadow().find('[part="source-title"]'),
  footer: () => SmartSnippetSelectors.shadow().find('[part="footer"]'),
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
  feedbackExplainWhy: () =>
    SmartSnippetSelectors.shadow().find(
      '[part="feedback-explain-why-button"]',
      {includeShadowDom: true}
    ),
};
