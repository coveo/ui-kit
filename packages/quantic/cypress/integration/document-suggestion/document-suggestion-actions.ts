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
  };
}

export const DocumentSuggestionActions = {
  ...documentSuggestionActions(DocumentSuggestionSelectors),
};
