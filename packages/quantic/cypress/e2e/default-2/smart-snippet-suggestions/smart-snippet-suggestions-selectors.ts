import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const smartSnippetSuggestionsComponent =
  'c-quantic-smart-snippet-suggestions';

export interface SmartSnippetSuggestionsSelector extends ComponentSelector {
  smartSnippetSuggestionsCard: () => CypressSelector;
  smartSnippetSuggestionHeading: (index: number) => CypressSelector;
  smartSnippetSuggestionsAnswer: (index: number) => CypressSelector;
  smartSnippetSuggestionsSourceUri: (index: number) => CypressSelector;
  smartSnippetSuggestionsSourceTitle: (index: number) => CypressSelector;
  smartSnippetSuggestionsInlineLink: (index: number) => CypressSelector;
}

export const SmartSnippetSuggestionsSelectors: SmartSnippetSuggestionsSelector =
  {
    get: () => cy.get(smartSnippetSuggestionsComponent),

    smartSnippetSuggestionsCard: () =>
      SmartSnippetSuggestionsSelectors.get().find(
        '[data-testid="smart-snippet-suggestions-card"]'
      ),
    smartSnippetSuggestionHeading: (index: number) =>
      SmartSnippetSuggestionsSelectors.get()
        .find('lightning-accordion-section .slds-accordion__summary-heading')
        .eq(index),
    smartSnippetSuggestionsAnswer: (index: number) =>
      SmartSnippetSuggestionsSelectors.get()
        .find('[data-testid="smart-snippet-answer"]')
        .eq(index),
    smartSnippetSuggestionsSourceUri: (index: number) =>
      SmartSnippetSuggestionsSelectors.get()
        .find('[data-testid="smart-snippet__source-uri"]')
        .eq(index),
    smartSnippetSuggestionsSourceTitle: (index: number) =>
      SmartSnippetSuggestionsSelectors.get()
        .find('[data-testid="smart-snippet__source-title"]')
        .eq(index),
    smartSnippetSuggestionsInlineLink: (index: number) =>
      SmartSnippetSuggestionsSelectors.get()
        .find('[data-cy="smart-snippet__inline-link"] > a')
        .eq(index),
  };
