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
        .invoke('removeAttr', 'target') // Otherwise opens a new tab that messes with the tests
        .click({force: true})
        .logAction(
          `When clicking the source title of the suggestion at the index ${index}`
        ),

    clickSmartSnippetSuggestionsSourceUri: (index: number) =>
      selector
        .smartSnippetSuggestionsSourceUri(index)
        .invoke('removeAttr', 'target') // Otherwise opens a new tab that messes with the tests
        .click()
        .logAction(
          `When clicking the source uri of the suggestion at the index ${index}`
        ),

    clickSmartSnippetSuggestionsInlineLink: (index: number) =>
      selector
        .smartSnippetSuggestionsInlineLink(index)
        .invoke('removeAttr', 'target') // Otherwise opens a new tab that messes with the tests
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
