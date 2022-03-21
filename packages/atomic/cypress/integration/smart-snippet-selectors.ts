export const smartSnippetComponent = 'atomic-smart-snippet';
export const SmartSnippetSelectors = {
  shadow: () => cy.get(smartSnippetComponent).shadow(),
  accessibilityHeading: () =>
    SmartSnippetSelectors.shadow().find('.accessibility-only'),
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
  showMoreButton: () =>
    SmartSnippetSelectors.shadow().find('[part="show-more-button"]', {
      includeShadowDom: true,
    }),
  showLessButton: () =>
    SmartSnippetSelectors.shadow().find('[part="show-less-button"]', {
      includeShadowDom: true,
    }),
  body: () => SmartSnippetSelectors.shadow().find('[part="body"]'),
  sourceUrl: () => SmartSnippetSelectors.shadow().find('[part="source-url"] a'),
  sourceTitle: () =>
    SmartSnippetSelectors.shadow().find('[part="source-title"] a'),
  footer: () => SmartSnippetSelectors.shadow().find('[part="footer"]'),
};
