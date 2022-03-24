export const smartSnippetComponent = 'atomic-smart-snippet';
export const SmartSnippetSelectors = {
  shadow: () => cy.get(smartSnippetComponent).shadow(),
  accessibilityHeading: () =>
    SmartSnippetSelectors.shadow().find('.accessibility-only'),
  smartSnippet: () =>
    SmartSnippetSelectors.shadow().find('[part="smart-snippet"]').first(),
  question: () =>
    SmartSnippetSelectors.shadow().find('[part="question"]').first(),
  answer: () =>
    SmartSnippetSelectors.shadow()
      .find('[part="answer"]', {includeShadowDom: true})
      .first(),
  sourceUrl: () =>
    SmartSnippetSelectors.shadow().find('[part="source-url"] a').first(),
  sourceTitle: () =>
    SmartSnippetSelectors.shadow().find('[part="source-title"] a').first(),
  footer: () => SmartSnippetSelectors.shadow().find('[part="footer"]').first(),
};
