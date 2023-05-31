import {
  SmartSnippetSuggestionsSelector,
  SmartSnippetSuggestionsSelectors,
} from './smart-snippet-suggestions-selectors';

function smartSnippetSuggestionsActions(
  selector: SmartSnippetSuggestionsSelector
) {
  return {
    clickSmartSnippetSuggestionsSourceTitle: (index: number) =>
      selector
        .smartSnippetSuggestionsSourceTitle(index)
        .click({force: true})
        .logAction(
          `When clicking the source title of the suggestion at the index ${index}`
        ),

    clickSmartSnippetSuggestionsSourceUri: (index: number) =>
      selector
        .smartSnippetSuggestionsSourceUri(index)
        .click()
        .logAction(
          `When clicking the source uri of the suggestion at the index ${index}`
        ),

    clickSmartSnippetSuggestionsInlineLink: (index: number) =>
      selector
        .smartSnippetSuggestionsInlineLink(index)
        .click()
        .logAction(
          `When clicking an inline link of the suggestion at the index ${index}`
        ),

    toggleSuggestion: (index: number) =>
      selector
        .smartSnippetSuggestionHeading(index)
        .click()
        .logAction(
          `When clicking the title of the suggestion at the index ${index}`
        ),
  };
}

export const SmartSnippetSuggestionsActions = {
  ...smartSnippetSuggestionsActions(SmartSnippetSuggestionsSelectors),
};
