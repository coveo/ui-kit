import {
  DocumentSuggestionSelector,
  DocumentSuggestionSelectors,
} from './document-suggestion-selectors';

function documentSuggestionActions(selector: DocumentSuggestionSelector) {
  return {
    clickSuggestion: (idx: number) =>
      selector
        .sectionTitle(idx)
        .click()
        .logAction(
          `When clicking on the document suggestion at the following index: ${idx}`
        ),
    openQuickview: (idx: number) =>
      selector
        .quickviewButton(idx)
        .click()
        .logAction(
          `When opening the quickview of the document suggestion at the following index: ${idx}`
        ),
    closeQuickview: () =>
      selector
        .quickviewCloseButton()
        .click()
        .logAction('When closing the quickview of a document suggestion.'),
  };
}

export const DocumentSuggestionActions = {
  ...documentSuggestionActions(DocumentSuggestionSelectors),
};
