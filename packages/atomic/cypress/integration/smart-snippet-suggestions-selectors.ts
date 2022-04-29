export const smartSnippetSuggestionsComponent =
  'atomic-smart-snippet-suggestions';

export const SmartSnippetSuggestionsSelectors = {
  shadow: () => cy.get(smartSnippetSuggestionsComponent).shadow(),
  container: () =>
    SmartSnippetSuggestionsSelectors.shadow().find('[part="container"]', {
      includeShadowDom: true,
    }),
  heading: () =>
    SmartSnippetSuggestionsSelectors.shadow().find('[part="heading"]', {
      includeShadowDom: true,
    }),
  questions: () =>
    SmartSnippetSuggestionsSelectors.shadow().find('[part="questions"]', {
      includeShadowDom: true,
    }),
  questionAnswerExpanded: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-answer-expanded"]',
      {
        includeShadowDom: true,
      }
    ),
  questionAnswerCollapsed: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-answer-collapsed"]',
      {
        includeShadowDom: true,
      }
    ),
  questionExpandedButton: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-expanded-button"]',
      {
        includeShadowDom: true,
      }
    ),
  questionCollapsedButton: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-collapsed-button"]',
      {
        includeShadowDom: true,
      }
    ),
  questionExpandedIcon: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-expanded-icon"]',
      {
        includeShadowDom: true,
      }
    ),
  questionCollapsedIcon: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-collapsed-icon"]',
      {
        includeShadowDom: true,
      }
    ),
  questionExpandedText: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-expanded-text"]',
      {
        includeShadowDom: true,
      }
    ),
  questionCollapsedText: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="question-collapsed-text"]',
      {
        includeShadowDom: true,
      }
    ),
  answerAndSource: () =>
    SmartSnippetSuggestionsSelectors.shadow().find(
      '[part="answer-and-source"]',
      {
        includeShadowDom: true,
      }
    ),
  answer: () =>
    SmartSnippetSuggestionsSelectors.shadow().find('[part="answer"]', {
      includeShadowDom: true,
    }),
  footer: () =>
    SmartSnippetSuggestionsSelectors.shadow().find('[part="footer"]', {
      includeShadowDom: true,
    }),
  sourceUrl: () =>
    SmartSnippetSuggestionsSelectors.shadow().find('[part="source-url"]', {
      includeShadowDom: true,
    }),
  sourceTitle: () =>
    SmartSnippetSuggestionsSelectors.shadow().find('[part="source-title"]', {
      includeShadowDom: true,
    }),
};
