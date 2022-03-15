export const smartSnippetComponent = 'atomic-smart-snippet';
export const SmartSnippetSelectors = {
  shadow: () => cy.get(smartSnippetComponent).shadow(),
  smartSnippet: () =>
    SmartSnippetSelectors.shadow().find('[part="smart-snippet"]').first(),
  heading: () =>
    SmartSnippetSelectors.shadow().find('[part="heading"]').first(),
  answer: () => SmartSnippetSelectors.shadow().find('[part="answer"]').first(),
  sourceUrl: () =>
    SmartSnippetSelectors.shadow().find('[part="source-url"] a').first(),
  sourceTitle: () =>
    SmartSnippetSelectors.shadow().find('[part="source-title"] a').first(),
  footer: () => SmartSnippetSelectors.shadow().find('[part="footer"]').first(),
};
