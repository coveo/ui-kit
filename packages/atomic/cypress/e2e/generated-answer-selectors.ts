export const generatedAnswerComponent = 'atomic-generated-answer';
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
};
